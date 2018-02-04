'use strict'
//import {duration2} from "script.js";
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_HOST = "https://api.yelp.com";
const SEARCH_PATH = "/v3/businesses/search";
const BUSINESS_PATH = "/v3/businesses/";
const TOKEN_PATH = "/oauth2/token";
const GRANT_TYPE = "client_credentials";

const NODE_THRESHOLD = 15; // 31 nodes max for graph alg.


const ACCESS_TOKEN = "g9p9BLtkh5mMy0q5hq4OES-H7hbCWetuC-AH0lWKvkcp4diO2unHx_HoxkgAg5Nl7LcJplMUJk_UGoEK9t6hVFodDefdHqcHc21qcA6qdaph4ZzBQjp5Awzla4B1WnYx";

const DEFAULT_DURATION = 30; // default duration spent at each place (in minutes)
const DEFAULT_WEIGHT = 10; // default weighting the user gives the node.

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

var endLatitude;
var endLongitude;

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
var loadingField = document.getElementById("loading");

var QTimeCode = document.getElementById("QTimeCode");


submitButton.addEventListener("click", retrieveParams);

var paramsValid = false;

var ourLongPath;

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
// Calls updateSearchResults()
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

    var locArr2 = getStart();
    startLatitude = locArr2[0];
    startLongitude = locArr2[1];

    var locArr3 = getEnd();
    endLatitude = locArr3[0];
    endLongitude = locArr3[1];

    updateSearchResults();
  } else {
    alert("Invalid coordinates + time inputs");
  }

}

// Updates the searchResults data object with data from Yelp API
async function updateSearchResults() {

  if(paramsValid) {
    loadingField.value="Loading";
    var promises = [];
    var checked = 0;
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
          checked++;
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
  businessDetails = []; // reset businessDetails array
  locationNames = []; // reset locations array
  locationIDs = [];

  Graph = [[],[]];

  var promises = [];
  var numBusinesses = searchResults.businesses.length;
  var batchSize = 3;
  var hits = 0;

  addNode(startLatitude + "," + startLongitude, 0, 0, 0, 0);
  addNode(endLatitude + "," + endLongitude, 0, 0, 0, 0);

  locationIDs = locationIDs.concat([startLatitude + "," + startLongitude]);
  locationIDs = locationIDs.concat([endLatitude + "," + endLongitude]);
  for(var i = 0; i < numBusinesses; i++) {
    if(hits <= batchSize) {
      hits++;
     promises = promises.concat([$.ajax(PROXY_URL + API_HOST + BUSINESS_PATH + searchResults.businesses[i].id, {
      type: "GET",
      contentType: "application/x-www-form-urlencoded",
      dataType: "json",
      headers: {'Authorization': 'bearer ' + ACCESS_TOKEN},
      success: function(data2) {

        if(data2.hours.length >= 1 && data2.hours[0].open.length > dayOfTheWeek &&
          parseInt(data2.hours[0].open[dayOfTheWeek].start) <= endTime &&
          parseInt(data2.hours[0].open[dayOfTheWeek].end) >= startTime && locationIDs.length < NODE_THRESHOLD) {

            // uses lat,long
            addNode(data2.coordinates.latitude + "," + data2.coordinates.longitude, parseInt(data2.hours[0].open[dayOfTheWeek].start),
            parseInt(data2.hours[0].open[dayOfTheWeek].end), DEFAULT_DURATION, data2.rating);

            // add name to locations
            locationNames = locationNames.concat([data2.name]);
            locationIDs = locationIDs.concat([data2.coordinates.latitude + "," + data2.coordinates.longitude]);

            // add to businessDetails array
            businessDetails = businessDetails.concat(data2);
          }

      },
      error: function() {
        console.log("get call error");
      }
      })]);
    } else {
      await Promise.all(promises);
      hits = 0;
      promises = [];
    }
  }

  console.log("done with promises");

  createEdges();
}
// after adding all the nodes, iterate with double for loop
async function createEdges() {
  console.log("creating edges");
  for(var i = 0; i < locationIDs.length; i++) {
    var startSplit = locationIDs[i].split(",");
    var startLat = parseFloat(startSplit[0]);
    var startLon = parseFloat(startSplit[1]);
    for(var j = 0; j < locationIDs.length; j++) {
      var endSplit = locationIDs[j].split(",");
      var endLat = parseFloat(endSplit[0]);
      var endLon = parseFloat(endSplit[1]);
      var timeBetween = Math.trunc(500 * Math.sqrt(Math.pow((startLat-endLat), 2) + Math.pow((startLon - endLon), 2)));
      console.log(startLat + " " + startLon + " " + endLat + " " + endLon + " " + timeBetween);
      addEdge(locationIDs[i], locationIDs[j], DEFAULT_WEIGHT);
      //addEdge(locationIDs[i], locationIDs[j], (timeBetween < 0 ? DEFAULT_WEIGHT : timeBetween ));
    }
  }
  console.log("done creating edges");

  if(checkComplete()) {
    ourLongPath = longPath(startLatitude + "," + startLongitude, endLatitude + "," + endLongitude, startTime, endTime);
    console.log("longPath executed");

    var latAndLongArray = [];
    for(var i = 0; i < ourLongPath.length; i++) {
      var localArr = ourLongPath[i].split(",");
      latAndLongArray = latAndLongArray.concat([[parseFloat(localArr[0]), parseFloat(localArr[1])]]);
    }
    console.log(latAndLongArray);

    getMapFromPlaces(latAndLongArray);
    loadingField.value="";
  }

  console.log("exiting createEdges");

}







// then call longPath, start dest, start time, end time
