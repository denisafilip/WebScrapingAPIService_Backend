const fs = require('fs');
const path = require('path');

class SentimentAnalysisService {
    constructor() {
        this.sentimentDictionary = this.constructWordDictionary(path.resolve(__dirname, "..\\..\\assets\\AFINN-111.txt"));
    }

    constructWordDictionary = (filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        const dictionary = {};
        lines.forEach(line => {
            // Skip empty lines
            if (line.trim() === '') return;
            const [word, score] = line.split('\t');
            dictionary[word] = parseInt(score, 10);
        });

        return dictionary;
    }

    tokenize = (text) => {
        return text.toLowerCase().match(/\b\w+\b/g);
    }

    analyzeTextCustom = (text) => {
        const words = this.tokenize(text);
        let score = 0;

        // Calculate the total sentiment score for the text
        words.forEach(word => {
            score += this.sentimentDictionary[word] || 0;
        });

        // Determine the overall sentiment based on the total score
        let overallSentiment = 'neutral';
        if (score > 0) {
            overallSentiment = 'positive';
        } else if (score < 0) {
            overallSentiment = 'negative';
        }

        return {
            score: score,
            overallSentiment: overallSentiment,
        };
    }
}

module.exports = SentimentAnalysisService;

/*const result = new SentimentAnalysisService().analyzeTextCustom('overwhelmed');

console.log(result);*/

