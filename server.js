const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const cron = require("node-cron");
const fs = require("fs");
const app = express();
const request=require('request');
const csv=require('csvtojson');
const getCSV = require('get-csv');
const port = process.env.PORT || 5000;

// Globals to store scraped data
var usa_cases_ts = {};
var state_cases_geo = [];
var country_cases = [];
var case_data = {};
var dateTime = '';

// Function parse data
function ParseData() {
    // Get current Eastern Standard time
    var today_var = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
    today_var = new Date(today_var);  
    var date_var = today_var.getFullYear()+'-'+(today_var.getMonth()+1)+'-'+today_var.getDate();
    var time_var = today_var.getHours() + ":" + today_var.getMinutes() + ":" + today_var.getSeconds();
    dateTime = '(EST) ' + date_var+' '+time_var;
  
    try{
      // Launch Puppeteer instance and navigate to worldometer site for scraping
      puppeteer.launch({headless: true, args:['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']}).then(async function(browser) {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        await page.goto('https://www.worldometers.info/coronavirus/');
  
        case_data = {};
        country_cases = [['Country', 'Total Cases', 'Total Deaths']];
        state_cases_geo = [['State', 'Total Cases', 'Total Deaths']];
  
        // Get the country names
        const covid_countries = await page.$$eval('#main_table_countries_today tbody tr td:nth-child(2)', function(country_names) {
          return country_names.map(function(country_name) {
            return country_name.innerText;
          });
        });
  
        // Get the total cases per country
        const covid_total_cases = await page.$$eval('#main_table_countries_today tbody tr td:nth-child(3)', function(total_cases) {
          return total_cases.map(function(case_count) {
            return case_count.innerText;
          });
        });

        // Get the total deaths per country
        const covid_total_deaths = await page.$$eval('#main_table_countries_today tbody tr td:nth-child(5)', function(total_deaths) {
          return total_deaths.map(function(death_count) {
            return death_count.innerText;
          });
        });
  
        // Format the data and push into country_cases obj
        for (var i = 0; i < covid_countries.length; i++){
          case_data[covid_countries[i]] = {total_cases: covid_total_cases[i], total_deaths: covid_total_deaths[i]};
          var country_name = covid_countries[i];
          if (covid_countries[i] == "USA") {country_name = "United States"}
          if (covid_countries[i] == "UK") {country_name = "United Kingdom"}
          if (covid_countries[i] == "S. Korea") {country_name = "South Korea"}
          if (covid_countries[i] == "Total:") {continue;}
          if (covid_countries[i] == "World") {continue;}
          country_cases.push([country_name, parseInt(covid_total_cases[i].replace(/,/g, '')), parseInt(covid_total_deaths[i].replace(/,/g, ''))]);
        }
        console.log("SCRAPING: completed country scraping");
        // Now get the USA state cases
        await page.goto('https://www.worldometers.info/coronavirus/country/us/');
  
        // Get the state name
        const covid_states = await page.$$eval('#usa_table_countries_today tbody tr td:nth-child(1)', function(state_names) {
          return state_names.map(function(state_name) {
            return state_name.innerText;
          });
        });
  
        // Get the state total cases
        const covid_states_cases = await page.$$eval('#usa_table_countries_today tbody tr td:nth-child(2)', function(cases) {
          return cases.map(function(case_) {
            return case_.innerText;
          });
        });
  
        // Get the state total deaths
        const covid_states_deaths = await page.$$eval('#usa_table_countries_today tbody tr td:nth-child(4)', function(deaths) {
          return deaths.map(function(death) {
            return death.innerText;
          });
        });
  
        // Format the state data
        for (var i = 0; i < covid_states.length; i++){
          var state_name = covid_states[i];
          if (covid_states[i] == "Total:") {continue;}
          if (covid_states[i] == "USA Total") {continue;}
          state_cases_geo.push([state_name, parseInt(covid_states_cases[i].replace(/,/g, '')), parseInt(covid_states_deaths[i].replace(/,/g, ''))]);
        }
        console.log("SCRAPING: completed state scraping");
        // Closing the Puppeteer controlled headless browser
        await browser.close();
  
        // Pull CSV data from JHU github for time series data
        getCSV('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
        .then(rows => {

          usa_cases_ts = {};

          // Parse the state time series data
          for (var i = 0; i < rows.length; i++){
            if (rows[i]['Country/Region'] == 'US'){
              delete rows[i]['Country/Region'];
              delete rows[i]['Lat'];
              delete rows[i]['Long'];
              delete rows[i]['Province/State'];
  
              for (var key in rows[i]){
                usa_cases_ts[key] = parseInt(rows[i][key]); 
              }
            }
          }
          
          // Current day's data is not updated yet, so replace with total cases
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; 
          var yyyy = '20';
          today = mm+'/'+dd+'/'+yyyy;
          usa_cases_ts[today] = case_data.USA.total_cases.replace(/,/g, "");
        });
      });
    } catch(err){
      console.log("error during cron job");
    }
}

// cron job to run scraping task and update data
cron.schedule("*/15 * * * *", function() {
  console.log("running a task every 15 minutes");
  ParseData();
});

// Endpoint to manually update data
app.get('/api', function(req, res) {
  ParseData();
});


// Return the built react code
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Endpoint to return data
app.get('/api/data', (req, res) => {
  res.send({ data: case_data, time: dateTime, ts_data: usa_cases_ts, country_cases: country_cases, state_cases_geo: state_cases_geo});
});


// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.static(path.join(__dirname, 'build')));

// Return the built react code
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
