const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

// Create RFP from natural language
router.post('/create-from-nl', rfpController.createFromNL);

// CRUD operations
router.get('/', rfpController.getAllRFPs);
router.get('/:id', rfpController.getRFPById);
router.put('/:id', rfpController.updateRFP);
router.delete('/:id', rfpController.deleteRFP);

// Send RFP to vendors
router.post('/:id/send', rfpController.sendRFP);

// Get proposals for an RFP
router.get('/:id/proposals', rfpController.getProposals);

module.exports = router;
