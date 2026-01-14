const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

// Create email transporter for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✓ Email service configured successfully');
    return true;
  } catch (error) {
    console.error('✗ Email service configuration error:', error.message);
    return false;
  }
};

// IMAP configuration for receiving emails
const getImapConfig = () => {
  return {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT) || 993,
    tls: process.env.IMAP_TLS === 'true',
    tlsOptions: { rejectUnauthorized: false }
  };
};

// Email template for RFP
const createRFPEmailTemplate = (rfp, referenceId) => {
  const requirementsList = rfp.requirements
    .map((req, index) => `${index + 1}. ${req.item} - ${req.specification} (Quantity: ${req.quantity})`)
    .join('\n');

  const evaluationCriteria = rfp.evaluationCriteria
    ? rfp.evaluationCriteria.map((criteria, index) => `${index + 1}. ${criteria}`).join('\n')
    : 'Price, Quality, Delivery Time';

  return {
    subject: `RFP: ${rfp.title} - Ref: ${referenceId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Request for Proposal</h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Reference ID:</strong> ${referenceId}</p>
          <p><strong>Deadline:</strong> ${new Date(rfp.deadline).toLocaleDateString()}</p>
        </div>

        <h3 style="color: #34495e;">Project Overview</h3>
        <p>${rfp.description}</p>

        <h3 style="color: #34495e;">Requirements</h3>
        <pre style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${requirementsList}</pre>

        <h3 style="color: #34495e;">Budget</h3>
        <p>${rfp.budget}</p>

        ${rfp.specialRequirements ? `
        <h3 style="color: #34495e;">Special Requirements</h3>
        <p>${rfp.specialRequirements}</p>
        ` : ''}

        <h3 style="color: #34495e;">Evaluation Criteria</h3>
        <pre style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${evaluationCriteria}</pre>

        <h3 style="color: #34495e;">Submission Instructions</h3>
        <p>Please reply to this email with your proposal including:</p>
        <ul>
          <li>Detailed pricing breakdown</li>
          <li>Payment terms</li>
          <li>Delivery timeline</li>
          <li>Warranty and support information</li>
          <li>Any special conditions or notes</li>
        </ul>

        <p><strong>Important:</strong> Please keep the reference ID (${referenceId}) in the subject line when replying.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
          <p>This is an automated email from ProcureAI RFP Management System.</p>
        </div>
      </div>
    `
  };
};

module.exports = {
  transporter,
  verifyEmailConfig,
  getImapConfig,
  createRFPEmailTemplate,
  Imap,
  simpleParser
};
