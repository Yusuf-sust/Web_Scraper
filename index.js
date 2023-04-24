const fs = require("fs");
const { startBrowser } = require("./browser");
const { getNextPageUrl, getItems, getTotalAdsCount, scrapeTruckItem} = require("./cheerio");

// initial page url
const initialUrl = "https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/ od-2014/q-actros? search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at %3Adesc";

// Scrapped function
async function scrapeData(currentUrl) {
    let browser;
    try {
        browser = await startBrowser();
        const page = await browser.newPage();
        const truckItems = [];
        console.log("Scrapping started..............");
        while(currentUrl) {
            await page.goto(currentUrl, { waitUntil: 'networkidle0'});
            const content = await page.content();

            if(currentUrl === initialUrl){
                const totalItems = await getTotalAdsCount(content);
                console.log(totalItems);
            }

            const itemsOfCurrentPage = await getItems(content);
            for(let item of itemsOfCurrentPage) {
                await page.goto(item.url, { waitUntil: 'networkidle0'});
                const itemContent = await page.content();
                const itemDescription = await scrapeTruckItem(itemContent);
                itemDescription['ID'] = item.id;
                itemDescription['url'] = item.url;
                truckItems.push(itemDescription);
            }

            const nextPageUrl = await getNextPageUrl(initialUrl, currentUrl, content);
            currentUrl= nextPageUrl;
        }
        console.log(truckItems);

        // Writing scrapping data to truckItems.js file
        fs.writeFile(
            'trackItems.json',
            JSON.stringify(truckItems),
            (err) => {
                if(err){
                    console.log("Unable to write file->", err);
                }
            }
        );
        console.log("Scrapping completed!!!!!!!");

        await browser.close();
    } catch (err) {
        console.log("Error for scrapping data -> ", err);
        await browser.close();
    }
        
    await browser.close();
    
  
}



// Scrapping start
scrapeData(initialUrl);