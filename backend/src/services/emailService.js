const { transporter, getImapConfig, createRFPEmailTemplate, Imap, simpleParser } = require('../config/email');
const { RFP, Vendor, Proposal, RFPVendor } = require('../models');
const { parseVendorResponse } = require('./aiService');


async function sendRFPToVendors(rfp, vendorIds) {
  const results = {
    success: [],
    failed: []
  };

  try {

    const vendors = await Vendor.findAll({
      where: {
        id: vendorIds
      }
    });

    if (vendors.length === 0) {
      throw new Error('No vendors found with provided IDs');
    }

    const referenceId = `RFP-${rfp.id}-${Date.now()}`;

    const emailTemplate = createRFPEmailTemplate(rfp, referenceId);

    for (const vendor of vendors) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: vendor.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });

        const [rfpVendor, created] = await RFPVendor.findOrCreate({
          where: {
            rfpId: rfp.id,
            vendorId: vendor.id
          },
          defaults: {
            sentAt: new Date(),
            emailStatus: 'sent'
          }
        });

        if (!created) {
          await rfpVendor.update({
            sentAt: new Date(),
            emailStatus: 'sent'
          });
        }

        results.success.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          email: vendor.email
        });

        console.log(`✓ RFP sent to ${vendor.name} (${vendor.email})`);
      } catch (error) {
        console.error(`✗ Failed to send RFP to ${vendor.name}:`, error.message);
        
        const [rfpVendor, created] = await RFPVendor.findOrCreate({
          where: {
            rfpId: rfp.id,
            vendorId: vendor.id
          },
          defaults: {
            emailStatus: 'failed'
          }
        });

        if (!created) {
          await rfpVendor.update({ emailStatus: 'failed' });
        }

        results.failed.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          email: vendor.email,
          error: error.message
        });
      }
    }

    if (results.success.length > 0) {
      await rfp.update({ status: 'sent' });
    }

    return {
      success: true,
      referenceId,
      results
    };
  } catch (error) {
    console.error('Error sending RFP to vendors:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}


async function monitorInbox() {
  return new Promise((resolve, reject) => {
    const imapConfig = getImapConfig();

    if (!imapConfig.user || !imapConfig.password || 
        imapConfig.user === '' || imapConfig.password === '' ||
        imapConfig.user === 'your_email@gmail.com' || 
        imapConfig.password === 'your_app_password_here') {
      console.log('⚠ IMAP credentials not configured. Skipping inbox monitoring.');
      return resolve({ processed: 0, message: 'IMAP not configured' });
    }

    const imap = new Imap(imapConfig);
    let processedCount = 0;

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('Error opening inbox:', err);
          imap.end();
          return reject(err);
        }

        imap.search(['UNSEEN'], async (err, results) => {
          if (err) {
            console.error('Error searching emails:', err);
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            console.log('No new emails found');
            imap.end();
            return resolve({ processed: 0 });
          }

          console.log(`Found ${results.length} unread email(s)`);

          const fetch = imap.fetch(results, { bodies: '', markSeen: true });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', async (stream, info) => {
              try {
                const parsed = await simpleParser(stream);

                const subject = parsed.subject || '';
                const refMatch = subject.match(/RFP-(\d+)-\d+/);
                
                if (!refMatch) {
                  console.log(`Email "${subject}" does not contain RFP reference ID. Skipping.`);
                  return;
                }

                const rfpId = parseInt(refMatch[1]);

                const rfp = await RFP.findByPk(rfpId);
                if (!rfp) {
                  console.log(`RFP with ID ${rfpId} not found. Skipping email.`);
                  return;
                }

                const senderEmail = parsed.from?.value?.[0]?.address;
                if (!senderEmail) {
                  console.log('Could not extract sender email. Skipping.');
                  return;
                }

                const vendor = await Vendor.findOne({ where: { email: senderEmail } });
                if (!vendor) {
                  console.log(`Vendor with email ${senderEmail} not found. Skipping.`);
                  return;
                }

                const emailContent = parsed.text || parsed.html || '';
                const parseResult = await parseVendorResponse(emailContent);

                if (!parseResult.success) {
                  console.error('Failed to parse vendor response:', parseResult.error);
                  return;
                }

                const proposalData = parseResult.data;

                const existingProposal = await Proposal.findOne({
                  where: {
                    rfpId: rfp.id,
                    vendorId: vendor.id
                  }
                });

                if (existingProposal) {
                  console.log(`⚠ Proposal from ${vendor.name} for RFP "${rfp.title}" already exists. Skipping duplicate.`);
                  return;
                }

                await Proposal.create({
                  rfpId: rfp.id,
                  vendorId: vendor.id,
                  pricing: proposalData.pricing || [],
                  totalCost: proposalData.totalCost,
                  paymentTerms: proposalData.paymentTerms,
                  deliveryTimeline: proposalData.deliveryTimeline,
                  warranty: proposalData.warranty,
                  specialConditions: proposalData.specialConditions,
                  rawEmailContent: emailContent,
                  parsedData: proposalData,
                  status: 'pending',
                  receivedAt: new Date()
                });

                processedCount++;
                console.log(`✓ Processed proposal from ${vendor.name} for RFP "${rfp.title}"`);
              } catch (error) {
                console.error('Error processing email:', error);
              }
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            imap.end();
            reject(err);
          });

          fetch.once('end', () => {
            console.log(`Finished processing emails. Processed: ${processedCount}`);
            imap.end();
            resolve({ processed: processedCount });
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
}


function startEmailMonitoring() {
  const interval = parseInt(process.env.EMAIL_CHECK_INTERVAL) || 300000;
  
  console.log(`Starting email monitoring (checking every ${interval / 1000} seconds)...`);

  monitorInbox().catch(err => console.error('Email monitoring error:', err));

  setInterval(() => {
    monitorInbox().catch(err => console.error('Email monitoring error:', err));
  }, interval);
}


async function sendProposalStatusEmail(proposal, status, customEmailBody = null) {
  try {
    const { generateStatusEmail } = require('./aiService');

    const fullProposal = await Proposal.findByPk(proposal.id, {
      include: [
        { model: RFP, as: 'rfp' },
        { model: Vendor, as: 'vendor' }
      ]
    });

    if (!fullProposal || !fullProposal.rfp || !fullProposal.vendor) {
      throw new Error('Proposal, RFP, or Vendor not found');
    }

    let emailBody;

    if (customEmailBody) {
      emailBody = customEmailBody;
    } else {
      const emailResult = await generateStatusEmail(
        fullProposal,
        fullProposal.rfp,
        fullProposal.vendor,
        status
      );

      if (!emailResult.success) {
        throw new Error('Failed to generate email: ' + emailResult.error);
      }
      
      emailBody = emailResult.emailBody;
    }

    const subject = status === 'accepted'
      ? `✓ Proposal Accepted - ${fullProposal.rfp.title}`
      : `Proposal Update - ${fullProposal.rfp.title}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: fullProposal.vendor.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Proposal Status Update</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${emailBody.split('\n').map(para => `<p style="line-height: 1.6; color: #333;">${para}</p>`).join('')}
            </div>
          </div>
          <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This is an automated message from the ProcureAI RFP Management System</p>
          </div>
        </div>
      `
    });

    console.log(`✓ ${status === 'accepted' ? 'Acceptance' : 'Rejection'} email sent to ${fullProposal.vendor.name}`);

    return {
      success: true,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending status email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendRFPToVendors,
  monitorInbox,
  startEmailMonitoring,
  sendProposalStatusEmail
};
