const cheerio = require("cheerio");
const { formateNumber } = require("./utilitis");

// Get netx page url if exist
async function getNextPageUrl(initialUrl, currentUrl, html) {
    try {
        const urlSplitingArray = currentUrl.split('=');
        const currentPageNumber = Number(urlSplitingArray[urlSplitingArray.length-1]);

        const $ = cheerio.load(html);
        const nodes = $('.ooa-1u8qly9 ul li');
        const isNextPageExist = $(nodes[nodes.length-1]).attr('aria-disabled');
        
        if(isNextPageExist === 'false') {
            if(initialUrl === currentUrl){
                return `${initialUrl}&page=2`;
                
            }else{
                return `${initialUrl}&page=${currentPageNumber+1}`;
            }
        }
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
}

// Get current page items list with item id and url
async function getItems(html) {
    try {
        const items = [];
        const $ = cheerio.load(html);
        $('.eayvfn60').each((row, rawElement) => {
            const id = $(rawElement).attr('id');
            const node = $(rawElement).find('a');
            const url = node.attr('href');
            items.push({
                id,
                url
            });
        })
        return items;
    } catch (err) {
        console.log(err);
        return [];
    }
}

//Get total items
async function getTotalAdsCount(html) {
    try {
        const $ = cheerio.load(html);
        const totalAdsCountsTextsArray = $('h1').text().split(' ');
        return totalAdsCountsTextsArray[2];
    } catch (err) {
        console.log(err);
        return 0;
    }
}

// Get all data of specific item
async function scrapeTruckItem(html) {
    try {
        const description = {};
        const $ = cheerio.load(html);
        let title = '';
        let price = '';
        
        $('.offer-title').each((row, rawElement) => {
            title = $(rawElement).text().trim();
        });
        
        $('.offer-price__number').each((row, rawElement) => {
            price = $(rawElement).text().trim().split(' ').join('');
        });

        $('.offer-params__item').each((row, rawElement) => {
            const id = $(rawElement).find('.offer-params__label').text().trim();
            const value = $(rawElement).find('.offer-params__value').text().trim();
            description[id] = value;
        })

        return {
            'Tytuł': title,
            'Cena': formateNumber(price),
            'Data pierwszej rejestracji w historii pojazdu': description['Data pierwszej rejestracji w historii pojazdu'],
            'Rok produkcji': description['Rok produkcji'],
            'Przebieg': formateNumber(description['Przebieg']),
            'Moc': description['Moc']
        };
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = {
    getNextPageUrl,
    getItems,
    getTotalAdsCount,
    scrapeTruckItem,
}