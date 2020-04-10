import React, { Component } from 'react';
import ReactGA from 'react-ga';
import logo from './logo.svg';
import './App.css';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import {Chart} from "react-google-charts";
import { LineChart, PieChart, ColumnChart,GeoChart, Timeline } from 'react-chartkick'
import 'chart.js'

class App extends Component {
  state = {
    data: {},
    usa_cases_ts: {},
    state_cases_geo: [],
    country_cases: [],
    USA_total_cases: 0,
    USA_total_deaths: 0,
    GLOBAL_total_cases: 0,
    GLOBAL_total_deaths: 0,
    time: ""
  };

  async componentDidMount() {

    // Set up google analytics
    ReactGA.initialize('UA-160186542-1');
    ReactGA.pageview("/index");

    // Get data from server
    await this.callBackendAPI()
      .then(res => {
        console.log(res.ts_data); 

        this.setState({ country_cases: res.country_cases, state_cases_geo: res.state_cases_geo, usa_cases_ts: res.ts_data,data: res.data, 
          time: res.time, USA_total_cases: res.data.USA.total_cases, USA_total_deaths: res.data.USA.total_deaths, GLOBAL_total_cases: res.data["Total:"].total_cases, 
          GLOBAL_total_deaths: res.data["Total:"].total_deaths});
      })
      .catch(err => console.log(err));
  }

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

            <div style={{width: "90%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By State</p>

              <Chart
                width={'100%'}
                chartType="GeoChart"
                data={this.state.state_cases_geo}
                options={{
                  region: 'US',
                  displayMode: 'regions',
                  resolution: 'provinces',
                  backgroundColor: '#81d4fa',
                  defaultColor: '#f5f5f5',
                }}
                mapsApiKey="AIzaSyCudIgYTjBdvrSWDx6-M-f7RKkpUSt6ukA"
                rootProps={{ 'data-testid': '1' }}
              />
            </div>
            <div style={{width: "90%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By Country</p>

              <Chart
                width={'100%'}
                chartType="GeoChart"
                data={this.state.country_cases}
                options={{
                  backgroundColor: '#81d4fa',
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
        </div>
      );

    } else {
      return (
        <div className="App">
          <header className="App-header">
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

              <Chart
                width={'100%'}
                height={'450px'}
                chartType="GeoChart"
                data={this.state.state_cases_geo}
                options={{
                  region: 'US',
                  displayMode: 'regions',
                  resolution: 'provinces',
                  backgroundColor: '#81d4fa',
                  defaultColor: '#f5f5f5',
                }}
                mapsApiKey="AIzaSyCudIgYTjBdvrSWDx6-M-f7RKkpUSt6ukA"
                rootProps={{ 'data-testid': '1' }}
              />
            </div>

            <div style={{width: "60%", margin: "0px auto"}}>
              <p style={{color: "white", fontWeight: "bold"}}>Total Cases Broken Down By Country</p>

              <Chart
                width={'100%'}
                height={'450px'}
                chartType="GeoChart"
                data={this.state.country_cases}
                options={{
                  backgroundColor: '#81d4fa',
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
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="WHO"
              theme="dark"
              options={{height: 3000}}
            />
          </div>
        </div>
      );

    }
  }
}

export default App;
