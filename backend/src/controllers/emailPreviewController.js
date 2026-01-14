const { Proposal, RFP, Vendor } = require('../models');
const { generateStatusEmail } = require('../services/aiService');

/**
 * Preview email before sending (for user review/edit)
 */
async function previewStatusEmail(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (accepted or rejected)'
      });
    }

    // Get full proposal with RFP and Vendor details
    const proposal = await Proposal.findByPk(id, {
      include: [
        { model: RFP, as: 'rfp' },
        { model: Vendor, as: 'vendor' }
      ]
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    if (!proposal.rfp || !proposal.vendor) {
      return res.status(404).json({
        success: false,
        error: 'RFP or Vendor information not found'
      });
    }

    // Generate AI email
    const emailResult = await generateStatusEmail(
      proposal,
      proposal.rfp,
      proposal.vendor,
      status
    );

    if (!emailResult.success) {
      // Check if it's a quota error
      if (emailResult.error && emailResult.error.includes('quota')) {
        return res.status(429).json({
          success: false,
          error: 'AI quota exceeded. Please compose the email manually or try again later.',
          quotaExceeded: true
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to generate email preview',
        details: emailResult.error
      });
    }

    // Return preview without sending
    const subject = status === 'accepted'
      ? `✓ Proposal Accepted - ${proposal.rfp.title}`
      : `Proposal Update - ${proposal.rfp.title}`;

    res.json({
      success: true,
      data: {
        subject: subject,
        body: emailResult.emailBody,
        vendorEmail: proposal.vendor.email,
        vendorName: proposal.vendor.name
      }
    });
  } catch (error) {
    console.error('Error generating email preview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  previewStatusEmail
};
