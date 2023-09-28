const express = require('express');
const { ScraperController } = require('../controllers/scraper.controller');

const router = express.Router();
const scraperController = new ScraperController();

router.get('/scrape', scraperController.scrapeWebpage);
router.get('/count', scraperController.getBlogContentWordCount);

// Export the router object
module.exports = router;