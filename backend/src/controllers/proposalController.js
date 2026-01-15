const { Proposal, RFP, Vendor } = require('../models');
const { compareProposals } = require('../services/aiService');

/**
 * Get all proposals for a specific RFP
 */
async function getProposalsByRFP(req, res) {
  try {
    const { rfpId } = req.params;

    const proposals = await Proposal.findAll({
      where: { rfpId },
      include: [
        { model: Vendor, as: 'vendor' },
        { model: RFP, as: 'rfp' }
      ],
      order: [['receivedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get single proposal by ID
 */
async function getProposalById(req, res) {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findByPk(id, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: RFP, as: 'rfp' }
      ]
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Compare multiple proposals using AI
 */
async function compareProposalsHandler(req, res) {
  try {
    const { rfpId, proposalIds } = req.body;

    if (!rfpId || !proposalIds || !Array.isArray(proposalIds) || proposalIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'RFP ID and proposal IDs array are required'
      });
    }

    // Get RFP
    const rfp = await RFP.findByPk(rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    // Get proposals
    const proposals = await Proposal.findAll({
      where: {
        id: proposalIds,
        rfpId: rfpId
      },
      include: [{ model: Vendor, as: 'vendor' }]
    });

    if (proposals.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No proposals found with provided IDs'
      });
    }

    const allProposalsHaveScores = proposals.every(p => p.aiScore !== null && p.aiAnalysis !== null);
    
    if (allProposalsHaveScores) {
      console.log('Using cached comparison results');
      
      const cachedComparison = proposals.map(p => {
        const analysis = p.aiAnalysis ? JSON.parse(p.aiAnalysis) : {};
        return {
          vendorId: p.vendorId,
          vendorName: p.vendor?.name,
          overallScore: p.aiScore,
          complianceScore: analysis.complianceScore || 0,
          priceScore: analysis.priceScore || 0,
          deliveryScore: analysis.deliveryScore || 0,
          pros: analysis.pros || [],
          cons: analysis.cons || [],
          deviations: analysis.deviations || []
        };
      });

      return res.json({
        success: true,
        data: {
          comparison: cachedComparison,
          summary: 'Comparison results retrieved from cache',
          recommendation: {
            vendorId: cachedComparison.reduce((max, item) => 
              item.overallScore > max.overallScore ? item : max
            ).vendorId,
            reasoning: 'Based on previously calculated scores'
          },
          cached: true
        }
      });
    }

    const comparisonResult = await compareProposals(rfp, proposals);

    if (!comparisonResult.success) {
      const isQuotaError = comparisonResult.error && 
        (comparisonResult.error.includes('quota') || comparisonResult.error.includes('429'));
      
      return res.status(isQuotaError ? 429 : 500).json({
        success: false,
        error: isQuotaError 
          ? 'AI quota exceeded. Daily limit reached (20 requests/day). Please try again tomorrow or view cached results if available.'
          : 'Failed to compare proposals',
        details: comparisonResult.error,
        quotaExceeded: isQuotaError
      });
    }

    const comparison = comparisonResult.data.comparison;
    for (const item of comparison) {
      const proposal = proposals.find(p => p.vendorId === item.vendorId);
      if (proposal) {
        await proposal.update({
          aiScore: item.overallScore,
          aiAnalysis: JSON.stringify({
            complianceScore: item.complianceScore,
            priceScore: item.priceScore,
            deliveryScore: item.deliveryScore,
            pros: item.pros,
            cons: item.cons,
            deviations: item.deviations
          })
        });
      }
    }

    res.json({
      success: true,
      data: { ...comparisonResult.data, cached: false }
    });
  } catch (error) {
    console.error('Error comparing proposals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update proposal status
 */
async function updateProposalStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, customEmailBody } = req.body;

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (pending, reviewed, accepted, rejected)'
      });
    }

    const proposal = await Proposal.findByPk(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    await proposal.update({ status });

    // Send email notification if accepted or rejected
    let emailSent = false;
    if (status === 'accepted' || status === 'rejected') {
      const { sendProposalStatusEmail } = require('../services/emailService');
      const emailResult = await sendProposalStatusEmail(proposal, status, customEmailBody);
      
      if (emailResult.success) {
        emailSent = true;
      } else {
        console.error('Failed to send notification email:', emailResult.error);
      }
    }

    res.json({
      success: true,
      data: proposal,
      message: `Proposal status updated to ${status}${emailSent ? '. Notification email sent to vendor.' : ''}`
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getProposalsByRFP,
  getProposalById,
  compareProposalsHandler,
  updateProposalStatus
};
