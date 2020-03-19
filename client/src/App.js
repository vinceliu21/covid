import React, { Component } from 'react';
import ReactGA from 'react-ga';
import logo from './logo.svg';
import './App.css';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
// import TwitterContainer from './TwitterContainer';
// import USAMap from "react-usa-map";
// import BarChart from 'react-bar-chart';
import {Chart} from "react-google-charts";

import { LineChart, PieChart, ColumnChart,GeoChart, Timeline } from 'react-chartkick'
import 'chart.js'

var config = {};
// var jd = {
//   "NJ": {
//     fill: "navy",
//     // clickHandler: (event) => console.log('Custom handler for NJ', event.target.dataset)
//   },
//   "NY": {
//     fill: "#CC0000",
//   },
//   "CA": {
//     fill: "navy",
//   }
// };
var ssss = {"WA":442,"NY":328,"CA":221,"MA":108,"GA":31,"CO":45,"FL":35,"NJ":29,"OR":24,"TX":27,"IL":32,"PA":22,"IA":16,"MD":12,"NC":15,"SC":12,"TN":18,"VA":17,"AZ":9,"IN":13,"KY":10,"NV":14,"NH":6,"MN":9,"NE":10,"OH":5,"RI":5,"WI":8,"CT":5,"HI":2,"OK":2,"UT":5,"KS":1,"LA":19,"MO":1,"VT":2,"AK":0,"AR":6,"DE":1,"ID":0,"ME":0,"MI":2,"MS":1,"MT":1,"NM":5,"ND":1,"SD":8,"WV":0,"WY":1};
const margin = {top: 20, right: 20, bottom: 30, left: 40};
var ddd = [["WA",442],["NY",328],["CA",221],["MA",108],["GA",31],["CO",45],["FL",35],["NJ",29],["OR",24],["TX",27],["IL",32],["PA",22],["IA",16],["MD",12],["NC",15],["SC",12],["TN",18],["VA",17],["AZ",9],["IN",13],["KY",10],["NV",14],["NH",6],["MN",9],["NE",10],["OH",5],["RI",5],["WI",8],["CT",5],["HI",2],["OK",2],["UT",5],["KS",1],["LA",19],["MO",1],["VT",2],["AK",0],["AR",6],["DE",1],["ID",0],["ME",0],["MI",2],["MS",1],["MT",1],["NM",5],["ND",1],["SD",8],["WV",0],["WY",1]];
var dddd = [ { text: "WA", value: 200}, {text: "CA", value: 100}, { text: "WAY", value: 200}, {text: "CAY", value: 100}, { text: "DWA", value: 200}, {text: "CDA", value: 100}    ];
class App extends Component {
  state = {
    data: {},
    usa_cases_ts: {},
    state_cases: [],
    country_cases: [],
    USA_total_cases: 0,
    USA_total_deaths: 0,
    GLOBAL_total_cases: 0,
    GLOBAL_total_deaths: 0,
    time: ""
  };

  // mapHandler = (event) => {
  //   alert(event.target.dataset.name);
  // };
  
  // percentageToHsl(percentage, hue0, hue1) {
  //   var hue = (percentage * (hue1 - hue0)) + hue0;
  //   return 'hsl(' + hue + ', 100%, 50%)';
  // }
  // setStates(states){
  //   var max_key = Object.keys(states).reduce((a, b) => states[a] > states[b] ? a : b);
  //   var min_key = Object.keys(states).reduce((a, b) => states[a] < states[b] ? a : b);
  //   var min = states[min_key];
  //   var max = states[max_key];
  //   var r1 = [min, max];
  //   console.log(states);
  //   console.log(r1);
  //   for (var key in states){
  //     var percentage = (states[key] - min) / (max - min);
  //     var color = this.percentageToHsl(percentage, 120, 0);  
  //     config[key] = {
  //       fill: color
  //     };
  //   }
  //   console.log(config);
  //   console.log("aite");
  // }

  // /* optional customization of filling per state and calling custom callbacks per state */
  // statesCustomConfig = () => {
  //   return {
  //     "NJ": {
  //       fill: "navy",
  //       // clickHandler: (event) => console.log('Custom handler for NJ', event.target.dataset)
  //     },
  //     "NY": {
  //       fill: "#CC0000"
  //     },
  //     "CA": {
  //       fill: "hsl(30.950226244343895, 100%, 50%)"
  //     }
  //   };
  // };

  // setBar(data){

  // }

  handleBarClick(element, id){ 
    console.log(`The bin ${element.text} with id ${id} was clicked`);
  }

  async componentDidMount() {
    // Call our fetch function below once the component mounts
    ReactGA.initialize('UA-160186542-1');
    ReactGA.pageview("/index");
    // console.log("dogg");
    // this.setStates(ssss);
    await this.callBackendAPI()
      .then(res => {
        console.log(res.ts_data); 
        // console.log("dogg");
        // this.setStates(ssss);
        this.setState({ country_cases: res.country_cases, state_cases: res.state_cases, usa_cases_ts: res.ts_data,data: res.data, time: res.time, USA_total_cases: res.data.USA.total_cases, USA_total_deaths: res.data.USA.total_deaths, GLOBAL_total_cases: res.data["Total:"].total_cases, GLOBAL_total_deaths: res.data["Total:"].total_deaths});
      })
      .catch(err => console.log(err));
  }
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const response = await fetch('/api/data');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  render() {
    const isMobile = window.innerWidth <= 500;

    if (isMobile){
      return (
        <div className="App">
          <header className="App-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1 className="App-title">Covid-19 Stats</h1>
          </header>
          <p style={{color:"white", fontStyle: "italic"}}>Data referenced from WHO, CDC, JHU, worldometer</p>
          <p style={{color: "white", fontWeight: "bold"}}>Last updated: {this.state.time}</p>
          <div className="App-intro">
            <p style={{color: "white", fontWeight: "bold"}}><span style={{fontSize: "200%"}}>USA</span> total cases: <span style={{fontSize: "200%"}}>{this.state.USA_total_cases}</span>, total deaths: <span style={{fontSize: "200%"}}>{this.state.USA_total_deaths}</span></p>
            <p style={{color: "white", fontWeight: "bold"}}><span style={{fontSize: "200%"}}>GLOBAL</span> total cases: <span style={{fontSize: "200%"}}>{this.state.GLOBAL_total_cases}</span>, total deaths: <span style={{fontSize: "200%"}}>{this.state.GLOBAL_total_deaths}</span></p>
            <div style={{width: "90%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>USA Total Cases</p>
              <LineChart data={this.state.usa_cases_ts} width="100%" name="Covid 19 data" color="white" />
            </div>
            <div style={{width: "90%", height: 400, margin: "0px auto" }}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By State</p>
              <ColumnChart data={this.state.state_cases} />

            </div>
            <div style={{width: "90%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By Country</p>

              <Chart
                width={'100%'}
                // height={'450px'}
                chartType="GeoChart"
                data={this.state.country_cases}
                options={{
                  // colorAxis: { colors: ['#00853f', 'black', '#e31b23'] },
                  backgroundColor: '#81d4fa',
                  // datalessRegionColor: '#f8bbd0',
                  defaultColor: '#f5f5f5',
                }}
                mapsApiKey="AIzaSyCudIgYTjBdvrSWDx6-M-f7RKkpUSt6ukA"
                rootProps={{ 'data-testid': '1' }}
              />
            </div>
          </div>
          <div className="tweets">
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="CDCgov"
              theme="dark"
              padding="10px"
              options={{height: 3000, width: "80%"}}
            />
            <div className="sliver">
  
            </div>
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="WHO"
              theme="dark"
              options={{height: 3000, width: "80%"}}
            />
          </div>
          <div/>
          {/* <a class="twitter-timeline" data-lang="en" data-width="400" data-height="3000" data-theme="dark" href="https://twitter.com/WHO?ref_src=twsrc%5Etfw">Tweets by WHO</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
          <a class="twitter-timeline" data-lang="en" data-width="400" data-height="3000" data-theme="dark" href="https://twitter.com/CDCgov?ref_src=twsrc%5Etfw">Tweets by CDCgov</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
        </div>
      );

    } else {
      return (
        <div className="App">
          <header className="App-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1 className="App-title">Covid-19 Stats</h1>
          </header>
          <p style={{color:"white", fontStyle: "italic"}}>Data referenced from WHO, CDC, JHU, worldometer</p>
          <p style={{color: "white", fontWeight: "bold"}}>Last updated: {this.state.time}</p>
          <div className="App-intro">
            <p style={{color: "white", fontWeight: "bold"}}><span style={{fontSize: "200%"}}>USA</span> total cases: <span style={{fontSize: "200%"}}>{this.state.USA_total_cases}</span>, total deaths: <span style={{fontSize: "200%"}}>{this.state.USA_total_deaths}</span></p>
            <p style={{color: "white", fontWeight: "bold"}}><span style={{fontSize: "200%"}}>GLOBAL</span> total cases: <span style={{fontSize: "200%"}}>{this.state.GLOBAL_total_cases}</span>, total deaths: <span style={{fontSize: "200%"}}>{this.state.GLOBAL_total_deaths}</span></p>
            
            <div style={{width: "60%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>USA Total Cases</p>
              <LineChart data={this.state.usa_cases_ts} width="100%" name="Covid 19 data" color="white" />
            </div>
            <div style={{width: "60%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By State</p>
              <ColumnChart data={this.state.state_cases} />

              {/* <p style={{color: "white", fontWeight: "bold"}}>USA Heat Map</p> */}
              {/* <USAMap title="ok" width="90%" customize={config} onClick={this.mapHandler} /> */}
            </div>

            <div style={{width: "60%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By Country</p>

              <Chart
                width={'100%'}
                height={'450px'}
                chartType="GeoChart"
                data={this.state.country_cases}
                options={{
                  // colorAxis: { colors: ['#00853f', 'black', '#e31b23'] },
                  backgroundColor: '#81d4fa',
                  // datalessRegionColor: '#f8bbd0',
                  defaultColor: '#f5f5f5',
                }}
                mapsApiKey="AIzaSyCudIgYTjBdvrSWDx6-M-f7RKkpUSt6ukA"
                rootProps={{ 'data-testid': '1' }}
              />
            </div>



          </div>

          <div className="tweets">
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="CDCgov"
              theme="dark"
              padding="10px"
              options={{height: 3000}}
            />
            {/* <div className="sliver">

            </div> */}
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="WHO"
              theme="dark"
              options={{height: 3000}}
            />
          </div>
          {/* <a class="twitter-timeline" data-lang="en" data-width="400" data-height="3000" data-theme="dark" href="https://twitter.com/WHO?ref_src=twsrc%5Etfw">Tweets by WHO</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
          <a class="twitter-timeline" data-lang="en" data-width="400" data-height="3000" data-theme="dark" href="https://twitter.com/CDCgov?ref_src=twsrc%5Etfw">Tweets by CDCgov</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
        </div>
      );

    }
  }
}

export default App;
