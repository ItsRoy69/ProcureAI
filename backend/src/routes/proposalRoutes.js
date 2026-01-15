const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const { previewStatusEmail } = require('../controllers/emailPreviewController');

router.get('/rfp/:rfpId', proposalController.getProposalsByRFP);

router.get('/:id', proposalController.getProposalById);

router.post('/:id/preview-email', previewStatusEmail);

router.post('/compare', proposalController.compareProposalsHandler);

router.put('/:id/status', proposalController.updateProposalStatus);

module.exports = router;
