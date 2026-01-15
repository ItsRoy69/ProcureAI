const { RFP, Vendor, Proposal } = require('../models');
const { convertNLToRFP } = require('../services/aiService');
const { sendRFPToVendors } = require('../services/emailService');


async function createFromNL(req, res) {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({
        success: false,
        error: 'User input is required'
      });
    }

    const aiResult = await convertNLToRFP(userInput);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process natural language input',
        details: aiResult.error
      });
    }

    const rfp = await RFP.create({
      ...aiResult.data,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: rfp
    });
  } catch (error) {
    console.error('Error creating RFP from NL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function getAllRFPs(req, res) {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const rfps = await RFP.findAll({
      where,
      include: [
        {
          model: Proposal,
          as: 'proposals',
          include: [{ model: Vendor, as: 'vendor' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rfps
    });
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function getRFPById(req, res) {
  try {
    const { id } = req.params;

    const rfp = await RFP.findByPk(id, {
      include: [
        {
          model: Proposal,
          as: 'proposals',
          include: [{ model: Vendor, as: 'vendor' }]
        }
      ]
    });

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    res.json({
      success: true,
      data: rfp
    });
  } catch (error) {
    console.error('Error fetching RFP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function updateRFP(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    await rfp.update(updateData);

    res.json({
      success: true,
      data: rfp
    });
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function deleteRFP(req, res) {
  try {
    const { id } = req.params;

    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    await rfp.destroy();

    res.json({
      success: true,
      message: 'RFP deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function sendRFP(req, res) {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vendor IDs array is required'
      });
    }

    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    const result = await sendRFPToVendors(rfp, vendorIds);

    res.json(result);
  } catch (error) {
    console.error('Error sending RFP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function getProposals(req, res) {
  try {
    const { id } = req.params;

    const proposals = await Proposal.findAll({
      where: { rfpId: id },
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

module.exports = {
  createFromNL,
  getAllRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  sendRFP,
  getProposals
};
