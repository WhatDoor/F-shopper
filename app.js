const axios = require('axios').default;
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto('https://www.coles.com.au/catalogues-and-specials/view-all#view=list&saleId=35476&areaName=c-nsw-met'); //Unsure if this link changes from week to week
  
  const num_of_items_element = await page.$(".rocket__navbar__pill");
  const num_of_items = await page.evaluate(element => element.textContent, num_of_items_element);
  console.log(num_of_items);

  // Intercept Get Request URL
  await page.on('request', async request => {
    if (request.url().includes("embed.salefinder.com.au/productlist/view")) {
      let coles_items_url = request.url()
      let coles_items_headers = request.headers()
      console.log(coles_items_url);
      console.log(coles_items_headers);

      await browser.close();

      get_all_coles_items(coles_items_url)
    }
  })

  // Click Show More Button - TODO - still only works half the time for some reason
  page.waitForSelector("#show-more")
  page.click("#show-more")
})();

function get_all_coles_items(url) {

  //Need to process url so we get all items

  axios.get(url).then(process_coles_items).catch(function (error) {
    console.log("failed to get all coles items!");
    console.log(error);
  })
}

function process_coles_items(response) {
  let coles_catalogue_raw = response.data.replace(/jQuery.+[0-9]\(/,"").slice(0, -1)

  fs.writeFile('dump.json', coles_catalogue_raw, function (err) {
    if (err) return console.log(err);
  });
}