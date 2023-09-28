const ScraperService = require('../services/scraper.service');

class ScraperController {
    constructor() {
        this.scraperService = new ScraperService();
    }

    scrapeWebpage = async (req, res, next) => {
        try {
            const { url, extractRules, screenshot } = req.query;
            const parsedExtractRules = extractRules ? extractRules.split(',') : [];

            const scrapedData = await this.scraperService.scrapeWebPage(url, parsedExtractRules, screenshot);

            res.json(scrapedData);
        } catch (error) {
            // If an error occurs, pass the error to the next middleware (error handling middleware)
            next(error);
        }
    };

    getBlogContentWordCount = async (req, res, next) => {
        try {
            const { url } = req.query;
            const scrapedData = await this.scraperService.getBlogContentWordCount(url);
            res.json(scrapedData);
        } catch (error) {
            // If an error occurs, pass the error to the next middleware (error handling middleware)
            next(error);
        }
    };
}

module.exports = {
    ScraperController,
};