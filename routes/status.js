const express = require('express');

const { body } = require('express-validator');
const statusController = require('../controllers/status');
const router = express.Router();

router.get('/status', statusController.getStatus);
router.post(
  '/status',
  [
    body('status')
      .trim()
      .notEmpty()
  ],
  statusController.setStatus
);
module.exports = router;
