import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { TwitterTimelineEmbed, TwitterShareButton, TwitterFollowButton, TwitterHashtagButton, TwitterMentionButton, TwitterTweetEmbed, TwitterMomentShare, TwitterDMButton, TwitterVideoEmbed, TwitterOnAirButton } from 'react-twitter-embed';
// import TwitterContainer from './TwitterContainer';

class App extends Component {
  state = {
    data: {},
    USA_total_cases: 0,
    USA_total_deaths: 0,
    GLOBAL_total_cases: 0,
    GLOBAL_total_deaths: 0,
    time: ""
  };

  componentDidMount() {
      // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => {console.log(res.data);console.log(res.data.USA.total_cases); this.setState({ data: res.data, time: res.time, USA_total_cases: res.data.USA.total_cases, USA_total_deaths: res.data.USA.total_deaths, GLOBAL_total_cases: res.data["Total:"].total_cases, GLOBAL_total_deaths: res.data["Total:"].total_deaths});})
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
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Covid-19 Stats</h1>
        </header>
        <div className="App-intro">
          <p style={{color: "white", fontWeight: "bold"}}><span style={{fontSize: "200%"}}>USA</span> total cases: <span style={{fontSize: "200%"}}>{this.state.USA_total_cases}</span>, total deaths: <span style={{fontSize: "200%"}}>{this.state.USA_total_deaths}</span></p>
          <p style={{color: "white", fontWeight: "bold"}}><span style={{fontSize: "200%"}}>GLOBAL</span> total cases: <span style={{fontSize: "200%"}}>{this.state.GLOBAL_total_cases}</span>, total deaths: <span style={{fontSize: "200%"}}>{this.state.GLOBAL_total_deaths}</span></p>
          <p style={{color: "white", fontWeight: "bold"}}>Last updated: {this.state.time}</p>
        </div>
        <div className="tweets">
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="CDCgov"
            theme="dark"
            options={{height: 3000, width: 400}}
          />
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="WHO"
            theme="dark"
            options={{height: 3000, width: 400}}
          />
        </div>
        <div/>
        {/* <a class="twitter-timeline" data-lang="en" data-width="400" data-height="3000" data-theme="dark" href="https://twitter.com/WHO?ref_src=twsrc%5Etfw">Tweets by WHO</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        <a class="twitter-timeline" data-lang="en" data-width="400" data-height="3000" data-theme="dark" href="https://twitter.com/CDCgov?ref_src=twsrc%5Etfw">Tweets by CDCgov</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
      </div>
    );
  }
}

export default App;
