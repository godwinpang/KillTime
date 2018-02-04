'use strict'

const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_HOST = "https://api.yelp.com";
const SEARCH_PATH = "/v3/businesses/search";
const BUSINESS_PATH = "/v3/businesses/";
const TOKEN_PATH = "/oauth2/token";
const GRANT_TYPE = "client_credentials";

const NODE_THRESHOLD = 20; // 31 nodes max for graph alg.


const ACCESS_TOKEN = "g9p9BLtkh5mMy0q5hq4OES-H7hbCWetuC-AH0lWKvkcp4diO2unHx_HoxkgAg5Nl7LcJplMUJk_UGoEK9t6hVFodDefdHqcHc21qcA6qdaph4ZzBQjp5Awzla4B1WnYx";

const DEFAULT_DURATION = 30; // default duration spent at each place (in minutes)
const DEFAULT_WEIGHT = 2; // default weighting the user gives the node.

// Global variables (with default values)
var keywords = ['restaurants', 'food'];
var latitude = 33.6490126; //updated by Google Maps API
var longitude = -117.8427879;
var radius = 40; // in meters
var startTime; // military time HHMM of the start time
var endTime; // military time HHMM of the end time ASSUMES THAT START AND END DATES ARE THE SAME
var dayOfTheWeek; // day of the week of startTime (0 is Monday; 6 is Sunday)

var startLatitude;
var startLongitude; 

var searchResults = [];
var businessDetails = [];
var locationNames = []; // String Array of locations inserted into the Graph
var locationIDs = []; // String Array of locations inserted into the Graph

// Form elements
var mySelect = document.getElementById("mySelect");
var startLocation = document.getElementById("startLocation");
var startTimeElem = document.getElementById("startTime");
var endLocation = document.getElementById("endLocation");
var endTimeElem = document.getElementById("endTime");
var submitButton = document.getElementById("submitButton");
var keywordsArea = document.getElementById("keywords");

var QTimeCode = document.getElementById("QTimeCode");


submitButton.addEventListener("click", retrieveParams);

var paramsValid = false;


// Get the modal
var modal = document.getElementById('myModal');
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";

}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// Updates the global variables with the data inputted by the user
// Calls updateSearchResults(getBusinessDetails)
function retrieveParams() {
  paramsValid = false;
  if(new Date(endTimeElem.value).getTime() <= Date.now()) {
    alert("Invalid date! End date must be bigger than current date.")
  } else if (new Date(endTimeElem.value).getTime() < new Date(startTimeElem.value).getTime()) {
    alert("Invalid date! End date must be bigger than start date.")
  } else if(startLocation.value != "" && endLocation.value != ""
      && startTimeElem.value != "" && endTimeElem.value != "") {
    console.log("valid inputs! ");

    paramsValid = true;
    if(keywordsArea.value != "") {
      keywords = keywordsArea.value.split("\n");
    }



    // Create Date objects from field data.
    var sT = new Date(startTimeElem.value);
    var eT = new Date(endTimeElem.value);

    // Calculate and shift the day of the week.
    dayOfTheWeek = (sT.getDay() + 6) % 7;

    // Calculate time of day
    startTime = sT.getHours() * 100 + sT.getMinutes();
    endTime = eT.getHours() * 100 + eT.getMinutes();

    var locArr = getCenterRadius();
    latitude = locArr[0]
    longitude = locArr[1]
    radius = 350 + (endTime - startTime);

    updateSearchResults();
  } else {
    console.log("Invalid coordinates + time inputs");
    console.log(startTimeElem.value);
    console.log(endTimeElem.value)
    console.log("day: " + startTime.getDay() + " hours: " + startTime.getHours() + "mins: " + startTime.getMinutes());
  }

}

// Updates the searchResults data object with data from Yelp API
async function updateSearchResults() {

  if(paramsValid) {
    var promises = [];
    for(var i = 0; i < keywords.length; i++) {
      console.log(keywords[i]);
      console.log(radius);
      promises = promises.concat([$.ajax(PROXY_URL + API_HOST + SEARCH_PATH, {
        type: "GET",
        data: {
          term: keywords[i],
          latitude: latitude,
          longitude: longitude,
          radius: radius
        },
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        headers: {'Authorization': 'bearer ' + ACCESS_TOKEN},
        success: function(data) {
          console.log(data);
          console.log(keywords[i]);
          searchResults = JSON.parse(JSON.stringify( data ));
        },
        error: function() {
          console.log("get call error");
        }
      })]);
    }

    await Promise.all(promises);
    getBusinessDetails();

  }
}

// Updates the business details (call after updateSearchResults has been called)
async function getBusinessDetails() {
  console.log("in getBusinessDetails() ");
  businessDetails = []; // reset businessDetails array
  locationNames = []; // reset locations array
  locationIDs = [];

  Graph = [[],[]];
  // RESET GRAPH??

  var promises = [];
  var checked = 0;
  for(var i = 0; i < searchResults.businesses.length; i++) {
    // filter bad results

    if(checked < NODE_THRESHOLD) {
       promises = promises.concat([$.ajax(PROXY_URL + API_HOST + BUSINESS_PATH + searchResults.businesses[i].id, {
        type: "GET",
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        headers: {'Authorization': 'bearer ' + ACCESS_TOKEN},
        success: function(data2) {
          console.log("length: " + locationIDs.length);

          if(data2.hours.length >= 1 && data2.hours[0].open.length > dayOfTheWeek &&
            parseInt(data2.hours[0].open[dayOfTheWeek].start) <= endTime &&
            parseInt(data2.hours[0].open[dayOfTheWeek].end) >= startTime) {

              // uses lat,long
              addNode(data2.coordinates.latitude + "," + data2.coordinates.longitude, parseInt(data2.hours[0].open[dayOfTheWeek].start),
              parseInt(data2.hours[0].open[dayOfTheWeek].end), DEFAULT_DURATION, data2.rating);

              // add name to locations
              locationNames = locationNames.concat([data2.name]);
              locationIDs = locationIDs.concat([data2.id]);

              // add to businessDetails array
              businessDetails = businessDetails.concat(data2);

              console.log(data2.id);

              checked++;
            }
        },
        error: function() {
          console.log("get call error");
        }
      })]);

    } else {
      break;
    }
  }
  await Promise.all(promises);
  createEdges();
}
// after adding all the nodes, iterate with double for loop
function createEdges() {
  console.log("creating edges");
  for(var i = 0; i < locationIDs.length; i++) {
    for(var j = 0; j < locationIDs.length; j++) {
      addEdge(locationIDs[i], locationIDs[j], DEFAULT_WEIGHT);
    }
  }
  console.log("done creating edges");
  if(checkComplete()) {
    longPath(latitude, longitude, startTime, endTime);
  }

}



// then call longPath, start dest, start time, end time
