require('dotenv').config();
const {JSDOM} = require("jsdom");
const webScrapingApiClient = require('webscrapingapi');

class ScraperService {
    constructor() {
        this.client = new webScrapingApiClient(process.env.WEB_SCRAPING_API_KEY);
    }

    isValidUrl(url) {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }

    // Construct the extract_rules parameter for the API call, based on the CSS selectors given by the user
    constructExtractRules(extractRules) {
       const rulesObject = extractRules.reduce((acc, rule) => {
           if (rule === "img") {
               acc["image"] = {
                   "selector": rule,
                   "output": "@src"
               }
           } else if (rule === "a") {
                acc["links"] = {
                     "selector": rule,
                     "output": "@href"
                }
           } else {
               acc[rule] = {
                   "selector": rule,
                   "output": "text",
               }
           }
           return acc;
        }, {});
       console.log(JSON.stringify(rulesObject));
        return JSON.stringify(rulesObject);
    }

    async scrapeWebPage(url, extractRules, screenshot) {
        if (!this.isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }

        const params = screenshot ? {
            "render_js": 1,
            "json_response": 1,
            "extract_rules": this.constructExtractRules(extractRules),
            "screenshot": 1,
        }
        :
        {
            "json_response": 1,
            "extract_rules": this.constructExtractRules(extractRules),
        };

        const response = await this.client.get(url, params);

        if (response.success) {
            try {
                console.log(response.response.body);

                const responseBodyJson = JSON.parse(response.response.body);
                if (screenshot) {
                    return {
                        "text": JSON.parse(responseBodyJson["evaluate_results"]),
                        "screenshot": responseBodyJson["screenshot"],
                    }
                } else {
                    return {
                        "text": JSON.parse(responseBodyJson["body"])
                    };
                }
            } catch (error) {
                throw new Error("Error parsing the response body");
            }
        } else {
            throw new Error(`Scraping Error: ${response.error}`);
        }

    }

    splitConcatenatedWords = (text) => {
        const words = text.split(/[\s.,;:!?()[\]{}"]+|\b-\b/g);
        const splitWord = (word) => {
            // Regular expression to find uppercase letter preceded by a lowercase letter
            const regex = /([a-z])([A-Z])/g;
            return word.replace(regex, '$1 $2');
        };
        return words.flatMap(word => splitWord(word).split(' '));
    }

    getBlogContentWordCount = async (url) => {
        if (!this.isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }

        const response = await this.client.get(url, {})

        if (response.success) {
            try {
                const {document} = new JSDOM(response.response.body).window;

                const elements = document.querySelectorAll("body > div > div > div > div > div > div > div");
                const elementsArray = Array.from(elements);
                const filteredArray = elementsArray
                    .filter(element => element.textContent.trim() !== '')
                    .map(element => element.textContent);

                const textContent = filteredArray.join(' ');
                const splitWords = this.splitConcatenatedWords(textContent);
                return {
                    "text": textContent,
                    "wordCount": splitWords.length
                };
            } catch (error) {
                console.log(error);
                throw new Error("Error parsing the response body");
            }
        } else {
            console.log("error");
            throw new Error(`Scraping Error: ${response.error}`);
        }
    }
}

module.exports = ScraperService;

