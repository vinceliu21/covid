const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const cron = require("node-cron");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 5000;


const request=require('request');
const csv=require('csvtojson');
const getCSV = require('get-csv');
 
const readStream = request.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv");

var usa_cases_ts = {};



// var usa_cases_data_ts = {"1/22/20":"0","1/23/20":"0","1/24/20":"0","1/25/20":"0","1/26/20":"0","1/27/20":"1","1/28/20":"1","1/29/20":"1","1/30/20":"1","1/31/20":"1","2/1/20":"1","2/2/20":"1","2/3/20":"1","2/4/20":"1","2/5/20":"1","2/6/20":"1","2/7/20":"1","2/8/20":"1","2/9/20":"1","2/10/20":"1","2/11/20":"1","2/12/20":"1","2/13/20":"1","2/14/20":"1","2/15/20":"1","2/16/20":"1","2/17/20":"1","2/18/20":"1","2/19/20":"1","2/20/20":"1","2/21/20":"1","2/22/20":"1","2/23/20":"1","2/24/20":"1","2/25/20":"1","2/26/20":"1","2/27/20":"1","2/28/20":"1","2/29/20":"6","3/1/20":"9","3/2/20":"14","3/3/20":"21","3/4/20":"31","3/5/20":"51","3/6/20":"58","3/7/20":"71","3/8/20":"83"};
var data = {};
var today = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
today = new Date(today);
// today.setTime(today.getTime()+today.getTimezoneOffset()*60*1000);
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = '(EST) ' + date+' '+time;

// schedule tasks to be run on the server   
cron.schedule("30 * * * *", function() {
  console.log("running a task every hour");


  var today_var = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
  today_var = new Date(today_var);  
  // today_var.setTime(today_var.getTime()+today_var.getTimezoneOffset()*60*1000);
  var date_var = today_var.getFullYear()+'-'+(today_var.getMonth()+1)+'-'+today_var.getDate();
  var time_var = today_var.getHours() + ":" + today_var.getMinutes() + ":" + today_var.getSeconds();
  dateTime = '(EST) ' + date_var+' '+time_var;
  try{
    // Launching the Puppeteer controlled headless browser and navigate to the Digimon website
    puppeteer.launch({headless: true, args:['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']}).then(async function(browser) {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(0);
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


      getCSV('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
      .then(rows => {

        let us = [];
        usa_cases_ts = {};
        var varDate = new Date('03-10-2020'); //dd-mm-YYYY
        varDate.setHours(0,0,0,0);
        var today = new Date();
        today.setHours(0,0,0,0);

        for (var i = 0; i < rows.length; i++){
          if (rows[i]['Country/Region'] == 'US'){
            delete rows[i]['Country/Region'];
            delete rows[i]['Lat'];
            delete rows[i]['Long'];
            
            // delete rows[i]['Province/State'];
            for (var key in rows[i]){
              if (key == 'Province/State'){continue;}
              var temp = new Date(key);
              temp.setHours(0,0,0,0);
              if (temp < varDate){
                if(rows[i]['Province/State'].includes(",")){
                  if (!(key in usa_cases_ts)){
                    usa_cases_ts[key] = parseInt(rows[i][key]);
                  } else{
                    usa_cases_ts[key] += parseInt(rows[i][key]);
                  }

                }

              }else{
                if (!rows[i]['Province/State'].includes(",")){
                  if (!(key in usa_cases_ts)){
                    usa_cases_ts[key] = parseInt(rows[i][key]);
                  } else{
                    usa_cases_ts[key] += parseInt(rows[i][key]);
                  }

                }
              }
            }
          }
        }

        var today = new Date();
        var dd = today.getDate();

        var mm = today.getMonth()+1; 
        var yyyy = '20';

        today = mm+'/'+dd+'/'+yyyy;
        console.log(today);

        var result1 = result.USA.total_cases.replace(/,/g, "");
        console.log(parseInt(result1));
        usa_cases_ts[today] = result1;

      });
    });
  } catch(err){
    console.log("error durring cron job");
  }
});

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// Wrapping the Puppeteer browser logic in a GET request
app.get('/api', function(req, res) {

  try{
      puppeteer.launch({headless: true, args:['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']}).then(async function(browser) {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        await page.goto('https://www.worldometers.info/coronavirus/');
        let result = {};

        var today_var = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        today_var = new Date(today_var);  
        // today_var.setTime(today_var.getTime()+today_var.getTimezoneOffset()*60*1000);
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


        getCSV('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
        .then(rows => {
      
          let us = [];
          usa_cases_ts = {};
          var varDate = new Date('03-10-2020'); //dd-mm-YYYY
          varDate.setHours(0,0,0,0);
          var today = new Date();
          today.setHours(0,0,0,0);
      
          for (var i = 0; i < rows.length; i++){
            if (rows[i]['Country/Region'] == 'US'){
              delete rows[i]['Country/Region'];
              delete rows[i]['Lat'];
              delete rows[i]['Long'];
              
              // delete rows[i]['Province/State'];
              for (var key in rows[i]){
                if (key == 'Province/State'){continue;}
                var temp = new Date(key);
                temp.setHours(0,0,0,0);
                if (temp < varDate){
                  if(rows[i]['Province/State'].includes(",")){
                    if (!(key in usa_cases_ts)){
                      usa_cases_ts[key] = parseInt(rows[i][key]);
                    } else{
                      usa_cases_ts[key] += parseInt(rows[i][key]);
                    }
      
                  }
      
                }else{
                  if (!rows[i]['Province/State'].includes(",")){
                    if (!(key in usa_cases_ts)){
                      usa_cases_ts[key] = parseInt(rows[i][key]);
                    } else{
                      usa_cases_ts[key] += parseInt(rows[i][key]);
                    }
      
                  }
                }
              }
            }
          }
          var today = new Date();
          var dd = today.getDate();

          var mm = today.getMonth()+1; 
          var yyyy = '20';

          today = mm+'/'+dd+'/'+yyyy;
          console.log(today);

          var result1 = result.USA.total_cases.replace(/,/g, "");
          console.log(parseInt(result1));
          usa_cases_ts[today] = result1;
      
      
        });

        res.send({data: result});
    });



  } catch(err){
    res.send({code: "error"});
  }
});

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

// create a GET route
app.get('/csv', async (req, res) => {
  //Use async / await
  getCSV('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
  .then(rows => {

    let us = [];
    usa_cases_ts = {};
    var varDate = new Date('03-10-2020'); //dd-mm-YYYY
    varDate.setHours(0,0,0,0);
    var today = new Date();
    today.setHours(0,0,0,0);

    for (var i = 0; i < rows.length; i++){
      if (rows[i]['Country/Region'] == 'US'){
        delete rows[i]['Country/Region'];
        delete rows[i]['Lat'];
        delete rows[i]['Long'];
        
        // delete rows[i]['Province/State'];
        for (var key in rows[i]){
          if (key == 'Province/State'){continue;}
          var temp = new Date(key);
          temp.setHours(0,0,0,0);
          if (temp < varDate){
            if(rows[i]['Province/State'].includes(",")){
              if (!(key in usa_cases_ts)){
                usa_cases_ts[key] = parseInt(rows[i][key]);
              } else{
                usa_cases_ts[key] += parseInt(rows[i][key]);
              }

            }

          }else{
            if (!rows[i]['Province/State'].includes(",")){
              if (!(key in usa_cases_ts)){
                usa_cases_ts[key] = parseInt(rows[i][key]);
              } else{
                usa_cases_ts[key] += parseInt(rows[i][key]);
              }

            }
          }
        }
      }
    }

    console.log(usa_cases_ts);
    res.send({ok: usa_cases_ts});

  });
});




// create a GET route
app.get('/api/data', (req, res) => {
  res.send({ data: data, time: dateTime, ts_data: usa_cases_ts});
});


app.use(express.static(path.join(__dirname, 'build')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

