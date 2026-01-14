const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const { previewStatusEmail } = require('../controllers/emailPreviewController');

// Get proposals by RFP
router.get('/rfp/:rfpId', proposalController.getProposalsByRFP);

// Get single proposal
router.get('/:id', proposalController.getProposalById);

// Preview email before sending (must be before /:id routes)
router.post('/:id/preview-email', previewStatusEmail);

// Compare proposals
router.post('/compare', proposalController.compareProposalsHandler);

// Update proposal status
router.put('/:id/status', proposalController.updateProposalStatus);

module.exports = router;
