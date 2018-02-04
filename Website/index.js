'use strict'

const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_HOST = "https://api.yelp.com";
const SEARCH_PATH = "/v3/businesses/search";
const BUSINESS_PATH = "/v3/businesses/";
const TOKEN_PATH = "/oauth2/token";
const GRANT_TYPE = "client_credentials";

const ACCESS_TOKEN = "g9p9BLtkh5mMy0q5hq4OES-H7hbCWetuC-AH0lWKvkcp4diO2unHx_HoxkgAg5Nl7LcJplMUJk_UGoEK9t6hVFodDefdHqcHc21qcA6qdaph4ZzBQjp5Awzla4B1WnYx";

const START_LOCATION_PLACEHOLDER = "Starting Location";
const END_LOCATION_PLACEHOLDER = "End Location";



// Global variables (with default values)
var keywords = ['food'];
var latitude = 33.6490126;
var longitude = -117.8427879;
var radius = 40; // in meters
var startTime;
var endTime;


var searchResults;
var businessDetails;

// Form elements
var mySelect = document.getElementById("mySelect");
var startLocation = document.getElementById("startLocation");
var startTimeElem = document.getElementById("startTime");
var endLocation = document.getElementById("endLocation");
var endTimeElem = document.getElementById("endTime");
var submitButton = document.getElementById("submitButton");
var keywordsArea = document.getElementById("keywords");


var paramsValid = false;



// Updates the global variables with the data inputted by the user
function retrieveParams() {
  paramsValid = false;
  if(endTimeElem.value <= Date.now()) {
    alert("Invalid date! End date must be bigger than current date.")
  } else if (endTimeElem.value <= startTimeElem.value) {
    alert("Invalid date! End date must be bigger than start date.")
  } else if(startLocation.value != "" && endLocation.value != ""
    && startTimeElem.value != "" && endTimeElem.value != "") {
    paramsValid = true;
    keywords = keywordsArea.value.split("\n");
    alert("Valid!!");
  } else {
    alert("Invalid coordinates + time inputs");
    alert(startTimeElem.value);
    alert(endTimeElem.value)
    startTime = new Date(startTimeElem.value);
    endTime = new Date(endTimeElem.value);
    alert(startTime.getDay());
    alert(startTime.getTime());

  }

}

// Updates the searchResults data object with data from Yelp API
function updateSearchResults(callback) {
  if(paramsValid) {
    $.ajax(PROXY_URL + API_HOST + SEARCH_PATH, {
      type: "GET",
      data: {
        term: keyword,
        latitude: latitude,
        longitude: longitude,
        radius: radius
      },
      contentType: "application/x-www-form-urlencoded",
      dataType: "json",
      headers: {'Authorization': 'bearer ' + ACCESS_TOKEN},
      success: function(data) {
        console.log(data);
        searchResults = JSON.parse(JSON.stringify( data ));
        callback();
      },
      error: function() {
        console.log("get call error");
      }
    })
  }

}

// Updates the business details (call after updateSearchResults has been called)
function getBusinessDetails() {
  businessDetails = [{}];

  console.log("in getBusinessDetails: " + searchResults.businesses[1].name);

  for(var i = 0; i < searchResults.businesses.length; i++) {
    $.ajax(PROXY_URL + API_HOST + BUSINESS_PATH + searchResults.businesses[i].id, {
      type: "GET",
      contentType: "application/x-www-form-urlencoded",
      dataType: "json",
      headers: {'Authorization': 'bearer ' + ACCESS_TOKEN},
      success: function(data2) {
        businessDetails = businessDetails.concat(data2);
      },
      error: function() {
        console.log("get call error");
      }
    })
  }
}

// Main
$(function () {
  initializeFields();
});
