const SentimentAnalysisService = require('../services/sentiment.service');

class SentimentController {
    constructor() {
        this.sentimentAnalysisService = new SentimentAnalysisService();
    }

    getSentimentAnalysis = async (req, res, next) => {
        try {
            const { text } = req.body;

            const sentimentAnalysis = this.sentimentAnalysisService.analyzeTextCustom(text);

            res.json({
                sentiment: sentimentAnalysis.overallSentiment,
            });
        } catch (error) {
            // If an error occurs, pass the error to the next middleware (error handling middleware)
            next(error);
        }
    };
}

module.exports = SentimentController;