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

        const response = await this.client.get(url,
            {}
        )

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


//new ScraperService().getBlogContentWordCount("https://wsa-test.vercel.app/blog/the-challenges-of-urban-living").then(r => console.log(r));
//new ScraperService().splitConcatenatedWords("Urban Life The Challenges of Urban Living Navigating the Urban JungleLiving in a bustling city comes with its own set of challenges. The continuous hustle and bustle can sometimes be overwhelming, offering both incredible opportunities and stiff competition. Let's take a closer look at the not-so-rosy aspects of urban life.The Downsides of City LivingNoise Pollution: The constant noise from traffic and construction sites can be a source of distress.High Cost of Living: Urban areas often come with a hefty price tag, including high rents and expensive amenities.Pollution: Cities are often characterized by high levels of pollution, which can negatively affect your health and well-being.Coping Strategies for UrbanitesDespite the challenges, there are ways to cope with the stresses of city life:Creating a Quiet Sanctuary: Make your home a quiet and peaceful sanctuary away from the noise and chaos.Community Engagement: Engage with your local community to foster relationships and build support systems.Finding Green Spaces: Make an effort to find and spend time in green spaces to reconnect with nature and find moments of calm.");
/*
const { document } = new JSDOM(response.response.body).window;
                console.log(document);
                const extractedData = extractRules.map(rule => {
                    const elements = document.getElementsByTagName(rule);
                    const elementsArray = Array.from(elements);
                    return elementsArray
                        .filter(element => element.textContent.trim() !== '')
                        .map(element => element.textContent);
                });
                console.log(extractedData);
 */

