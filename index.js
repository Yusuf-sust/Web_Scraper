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

        let truckItems = [];

        console.log("Scrapping started..............");

        // Loop for traversing every page
        while(currentUrl) {
            await page.goto(currentUrl, { waitUntil: 'networkidle0'});

            const content = await page.content();

            if(currentUrl === initialUrl){
                const totalItems = await getTotalAdsCount(content);
                console.log("Total Items Found : ",totalItems);
            }

            // get items for current page
            const itemsOfCurrentPage = await getItems(content);

            // scarapping 5 items of current page asyncronously
            for(i = 0; i < itemsOfCurrentPage.length; i += 5) {
                const slice5Items = itemsOfCurrentPage.slice(i, i+5);

                // get every item description
                let itemsData = await Promise.all(slice5Items.map( async item => {
                    try{
                        const itemPage = await browser.newPage();
                        await itemPage.goto(item.url, { waitUntil: 'networkidle0'});
                        const itemContent = await itemPage.content();
                        const itemDescription = await scrapeTruckItem(itemContent);

                        if(itemDescription === null) {
                            await itemPage.close();
                            return null;
                        }

                        itemDescription['ID'] = item.id;
                        itemDescription['Url'] = item.url;
                        await itemPage.close();
        
                        return itemDescription;
                    } catch (err) {
                        return null;
                    }
                    
                }));

                itemsData = itemsData.filter(item => item !== null);
                truckItems = [...truckItems, ...itemsData];
            }
            // get next page url
            const nextPageUrl = await getNextPageUrl(initialUrl, currentUrl, content);
            currentUrl= nextPageUrl;
        }

        // Writing scrapping data to truckItems.js file
        fs.writeFile(
            'trackItems.json',
            JSON.stringify(truckItems, null, 2),
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

// Scrapping start...
scrapeData(initialUrl);