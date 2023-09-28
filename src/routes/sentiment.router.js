const express = require('express');
const SentimentController = require('../controllers/sentiment.controller');

const router = express.Router();
const sentimentController = new SentimentController();

router.post('/sentiment', sentimentController.getSentimentAnalysis);

// Export the router object
module.exports = router;