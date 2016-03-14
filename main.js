// main.js

var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
var $ = require('jquery');

// Forcast.io API Key
var apiKey = '2a3a882278ca2b64e57a7b4f031aa69d';
var lat;
var long;
var temp = {"currently": {"temperature": "--"}};
var url = "https://api.forecast.io/forecast/"+apiKey+"/"+lat+","+long+"/?units=si";

// ProductHunt API Key
var productHuntKey = "9bd70f56b8430f9cc7b757bb1ce29e3de13cef6ccece12477b0d91149c56cc5d";
// variable Getters & Setters
function updateLatitude(coord) {
  lat = coord;
}
function updateLongitude(coord) {
  long = coord;
}
function updateURL() {
  url = "https://api.forecast.io/forecast/"+apiKey+"/"+lat+","+long+"/?units=si";
}
function setLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          updateLatitude(position.coords.latitude);
          updateLongitude(position.coords.longitude);
          updateURL();
          callback();
        });
    } else { 
    }
}
// Update location
// - update location if location has changed (threshold -> 0.1 degrees)
function updateLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          if (Math.abs(lat-position.coords.latitude) >= 0.1) {
            console.log("Updating Latitude: " + lat + " -> " + position.coords.latitude);
            updateLatitude(position.coords.latitude);
            updateURL();
          }
          if (Math.abs(long-position.coords.longitude) >= 0.1) {
            console.log("Updating Longitude: " + long + " -> " + position.coords.longitude);
            updateLongitude(position.coords.longitude);
            updateURL();
          }
        });
    } else { 
    }
}

// Current temperature
var CurrentTemp = React.createClass({
  getInitialState: function() {
    return {data: {}};
  },
  getWeatherImage: function() {
      if (this.props.data.currently.icon == "partly-cloudy-day") {
        this.state.data.weatherImage = "./img/partly-cloudy.svg";
      }
      else if (this.props.data.currently.icon == "clear-day") {
        this.state.data.weatherImage = "./img/sunny.svg";
      }
      else {
        console.log(this.props.data.currently.icon);
        this.state.data.weatherImage = "./img/cloudy.svg";
      }
  },
  componentDidMount: function() {

  },
  render: function() {
    console.log("Rendering the current temperature.");
    // If no weather update
    if (typeof(this.props.data.currently) === "undefined") {
      console.log("Still no weather update yet...");
      return(<h1>--</h1>);
    }
    // Weather has been received
    else {
      this.getWeatherImage();
      console.log("Got an update on the temperature!");
      console.log("data: ",this.props.data);
      console.log("image: ",this.state.data.weatherImage);
      return (
        <div>
          <h1 className="">{Math.round(this.props.data.currently.temperature)} <img src={this.state.data.weatherImage}/></h1>
          <h2>{this.props.data.hourly.summary}</h2>
          <h3><i className="icon ion-umbrella"></i> {parseFloat(this.props.data.currently.precipProbability)*100}%</h3>
        </div>
      );
    }
  }
});

var CurrentWeather = React.createClass({
  getInitialState: function() {
    return {data: {"test": 2}};
  },
  getCurrentTemp: function() {
    updateLocation();
    $.ajax({
      url: url,
      dataType: 'jsonp',
      crossDomain: true,
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    setLocation(this.getCurrentTemp);
    setInterval(this.getCurrentTemp, 50000); // get tempupdate every 50s
  },
  render: function() {
    return (
      <CurrentTemp data={this.state.data} />
    );
  }
});

// Date and Time
var DateAndTime = React.createClass({
  refreshTime: function() {
    this.setState({
      date: {
        time: moment().format('h:mm'),
        day: moment().format('dddd'),
        month: moment().format('MMMM D')
      }
    });
  },
  getInitialState: function() {
    return ({
      date: {
        time: moment().format('h:mm'),
        day: moment().format('dddd'),
        month: moment().format('MMMM D')
      }
    });
  },
  componentDidMount: function() {
    setInterval(this.refreshTime, 9000);
  },
  render: function() {
    return (
      <div>
        <h1>{this.state.date.time}</h1>
        <h2>{this.state.date.day}</h2>
        <h2>{this.state.date.month}</h2>
      </div>
    );
  }
});


function getNews(callback) {

}

var Article = React.createClass({
  render: function() {
    return(
      <div>
        <i className="icon ion-clipboard"></i>
        <a href={this.props.url}>{this.props.data}</a>
      </div>
    );
  }
});

// Get News
var News = React.createClass({
  getVergeNews: function() {
    // get a list of itemId's and add the top 5 to the data list
    $.ajax({
      url: "http://www.theverge.com/rss/frontpage",
      dataType: 'xml',
      crossDomain: true,
      cache: false,
      success: function(data) {
        var articles = [];
        //console.log($(data).find("entry").find("title"));
        for (var i = 0; i <= 3; i++) {
          articles.push({
            title: $(data).find("entry")[i].getElementsByTagName("title")[0].firstChild.nodeValue,
            url: $(data).find("entry")[i].getElementsByTagName("link")[0].getAttribute('href')
          });
        }
        this.setState({data: articles});
        console.log(this.state);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return({data: []});
  },
  componentDidMount: function() {
    this.getVergeNews();
    setInterval(this.getVergeNews, 9000);
  },
  render: function() {
    var articles = this.state.data.map(function (article) {
      return(
        <Article data={article.title} url={article.url} key={article.title} />
      );
    });
    return(
      <div>
        <p>News</p>
        {articles}
        {console.log(this.state.data)}
      </div>
    );
  }
});

// Main
ReactDOM.render(
  <CurrentWeather/>, 
  document.getElementById("current")
);
ReactDOM.render(
  <DateAndTime />,
  document.getElementById("date")
);
ReactDOM.render(
  <News/>,
  document.getElementById("news")
);
