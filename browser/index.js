const puppeteer = require('puppeteer');

// Browser starting function
async function startBrowser() {
    let browser;
    try{
        console.log('Opening the browser..............');
        browser = await puppeteer.launch({
            headless: true,
        });
    } catch (err) {
        console.log('Counld not create a browser instance => : ', err);
        throw err;
    }

    return browser;
}

module.exports = {
    startBrowser,
}