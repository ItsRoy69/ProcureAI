const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

router.post('/create-from-nl', rfpController.createFromNL);

router.get('/', rfpController.getAllRFPs);
router.get('/:id', rfpController.getRFPById);
router.put('/:id', rfpController.updateRFP);
router.delete('/:id', rfpController.deleteRFP);

router.post('/:id/send', rfpController.sendRFP);

router.get('/:id/proposals', rfpController.getProposals);

module.exports = router;
