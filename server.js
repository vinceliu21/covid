const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const cron = require("node-cron");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 5000;

var data = {};
var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = '(EST) ' + date+' '+time;

// schedule tasks to be run on the server   
cron.schedule("* 1 * * *", function() {
  console.log("running a task every hour");

  var today_var = new Date();
  var date_var = today_var.getFullYear()+'-'+(today_var.getMonth()+1)+'-'+today_var.getDate();
  var time_var = today_var.getHours() + ":" + today_var.getMinutes() + ":" + today_var.getSeconds();
  dateTime = '(EST) ' + date_var+' '+time_var;

  // Launching the Puppeteer controlled headless browser and navigate to the Digimon website
  puppeteer.launch().then(async function(browser) {
    const page = await browser.newPage();
    // await page.goto('http://digidb.io/digimon-list/');
    await page.goto('https://www.worldometers.info/coronavirus/');
    let result = {};
    

    const covid_countries = await page.$$eval('#main_table_countries tbody tr td:nth-child(1)', function(country_names) {
      return country_names.map(function(country_name) {
        return country_name.innerText;
      });
    });

    const covid_total_cases = await page.$$eval('#main_table_countries tbody tr td:nth-child(2)', function(total_cases) {
      return total_cases.map(function(case_count) {
        return case_count.innerText;
      });
    });
    
    const covid_total_deaths = await page.$$eval('#main_table_countries tbody tr td:nth-child(4)', function(total_deaths) {
      return total_deaths.map(function(death_count) {
        return death_count.innerText;
      });
    });

    for (var i = 0; i < covid_countries.length; i++){
      result[covid_countries[i]] = {total_cases: covid_total_cases[i], total_deaths: covid_total_deaths[i]};
    }

    // Closing the Puppeteer controlled headless browser
    await browser.close();

    data = result;
  });
});

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// Wrapping the Puppeteer browser logic in a GET request
app.get('/api', function(req, res) {

  // Launching the Puppeteer controlled headless browser and navigate to the Digimon website
  puppeteer.launch().then(async function(browser) {
      const page = await browser.newPage();
      // await page.goto('http://digidb.io/digimon-list/');
      await page.goto('https://www.worldometers.info/coronavirus/');
      let result = {};

      var today_var = new Date();
      var date_var = today_var.getFullYear()+'-'+(today_var.getMonth()+1)+'-'+today_var.getDate();
      var time_var = today_var.getHours() + ":" + today_var.getMinutes() + ":" + today_var.getSeconds();
      dateTime = '(EST) ' + date_var+' '+time_var;

      const covid_countries = await page.$$eval('#main_table_countries tbody tr td:nth-child(1)', function(country_names) {
        return country_names.map(function(country_name) {
          return country_name.innerText;
        });
      });

      const covid_total_cases = await page.$$eval('#main_table_countries tbody tr td:nth-child(2)', function(total_cases) {
        return total_cases.map(function(case_count) {
          return case_count.innerText;
        });
      });
      
      const covid_total_deaths = await page.$$eval('#main_table_countries tbody tr td:nth-child(4)', function(total_deaths) {
        return total_deaths.map(function(death_count) {
          return death_count.innerText;
        });
      });

      for (var i = 0; i < covid_countries.length; i++){
        // result.push({country: covid_countries[i], total_cases: covid_total_cases[i], total_deaths: covid_total_deaths[i]});
        result[covid_countries[i]] = {total_cases: covid_total_cases[i], total_deaths: covid_total_deaths[i]};
      }

      // Closing the Puppeteer controlled headless browser
      await browser.close();

      data = result;

      res.send({data: result});
  });
});

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});


// create a GET route
app.get('/api/data', (req, res) => {
  res.send({ data: data, time: dateTime});
});


app.use(express.static(path.join(__dirname, 'build')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

