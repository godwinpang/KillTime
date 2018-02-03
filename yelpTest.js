

var searchResults; 


var keyword = 'peking duck';
var latitude = 33.6490126;
var longitude = -117.8427879;
var radius = 4000;

$(function () {

var PROXY_URL = "https://cors-anywhere.herokuapp.com/";
var API_HOST = "https://api.yelp.com";
var SEARCH_PATH = "/v3/businesses/search";
var BUSINESS_PATH = "/v3/businesses/";
var TOKEN_PATH = "/oauth2/token";
var GRANT_TYPE = "client_credentials";

var CLIENT_ID = "0nz4Z_fUc4ZJOU_SDrOtdQ";  // dummy id for stackoverflow purposes
var CLIENT_SECRET = "1ud5K7yLjfODbKCoAxKxIOLvyFlr9YboP5aNxyQgYhAWup1RXxa2bIOEkIHT86nF";  // dummy secret for stackoverflow purposes
var ACCESS_TOKEN = "g9p9BLtkh5mMy0q5hq4OES-H7hbCWetuC-AH0lWKvkcp4diO2unHx_HoxkgAg5Nl7LcJplMUJk_UGoEK9t6hVFodDefdHqcHc21qcA6qdaph4ZzBQjp5Awzla4B1WnYx";




$.ajax(PROXY_URL + API_HOST + TOKEN_PATH, {
    type: "POST",
    data: {
        grant_type: GRANT_TYPE,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    },
    contentType: "application/x-www-form-urlencoded",
    dataType: "json",
    success: function (data) {
        console.log(data);

    },
    error: function () {
        console.log("post call error");
    }


  })

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
      searchResults = data; 
      $.ajax(PROXY_URL + API_HOST + BUSINESS_PATH + searchResults.businesses[4].id, {
        type: "GET",
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        headers: {'Authorization': 'bearer ' + ACCESS_TOKEN},
        success: function(data2) {
          console.log("business data: ");
          console.log(data2);
        },
        error: function() {
          console.log("get call error");
        }
      })
    },
    error: function() {
      console.log("get call error");
    }
  })


});


