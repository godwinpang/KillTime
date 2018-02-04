var places // var to store path from kev
var map
var startMarker
var endMarker
var centerPt
var directionsDisplay = new google.maps.DirectionsRenderer
var directionsService = new google.maps.DirectionsService

/**
 * This function takes in the longitudes and latitudes of the starting and
 * destination points and returns the time taken to walk between said points. If
 * the path between the two points is unwalkable, then function returns -1
 *
 * input: startLng, startLat, destLng, destLat ; pretty self explanatory
 * output: time needed to walk from a to b
 *          -1 if path is not walkable
 */

function getTimeBetweenTwo(startLng, startLat, destLng, destLat){
    var start = new google.maps.LatLng(startLng, startLat)
    var end = new google.maps.LatLng(destLng, destLat)
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
        {
            origins: [start],
            destinations: [end],
            travelMode : google.maps.TravelMode["WALKING"]
        }, callback);
    function callback(response, status){
        if (status == 'OK'){
            var duration = response.rows[0].elements[0].duration.value
            console.log("duration: " + duration)
        }
    }
}

/**
 * This function takes in a 2D array of integers corresponding to longitudinal
 * and latitude. The 2D array is sorted so that it corresponds to the actual
 * order of places to be visited.
 */

function getMapFromPlaces(places){
    var stops = new Array(places.length-2)
    for (i = 0 ; i < stops.length ; i++){
        stops[i] = new Array(2)
    }
    for (j = 0 ; j < stops.length ; j++){
        for (k = 0 ; k < 2 ; k++){
            stops[j][k] = places[i][k]
        }
    }

    var stopPts = new Array(stops.length)
    for (i = 0 ; i < stopPts.length ; i++){
        var temp = new google.maps.LatLng(stops[i][0], stops[i][1])
        stopPts[i] = {location: temp}
    }
    var startPt = new google.maps.LatLng(places[0][0], places[0][1])
    var endPt = new google.maps.LatLng(places[places.length-1][0], places[places.length-1][1])

    var request = {
        origin: startPt,
        destination: endPt,
        travelMode: google.maps.TravelMode['WALKING'],
        waypoints: stopPts
    }
    directionsService.route(request, function(response, status){
        if (status == 'OK'){
            directionsDisplay.setDirections(response)
        } else {
            window.alert('i messed up because ' + status)
        }
    })
}

function arrToStr(arr){
    var retStr = ""
    for (i = 0 ; i < arr.length ; i++){
        retStr = retStr.concat(arr[i])
        if (i != arr.length - 1){
            retStr = retStr.concat("+")
        }
    }
    return retStr
}

function strToArr(str){
    var arrLatLngPairs = str.split('+')
    var retArr = new Array(arrLatLngPairs.length)
    for (i = 0 ; i < retArr.length ; i++){
        retArr[i] = new Array(2)
    }
    for (j = 0 ; j < retArr.length ; j++){
        retArr[i] = str.split(arrLatLngPairs[i])
    }
    return retArr
}

/**
 * This function takes in an array storing the longitude latitude pair of where
 * the map should be centered around. It then initializes a map for the map.
 */

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 33.653334, lng: -117.839316}
    })
    directionsDisplay.setMap(map)
    //getMapFromPlaces(directionsService, directionsDisplay, places)

    // Create the search box and link it to the UI element.
    var inputStart = document.getElementById('startLocation')
    var startSearchBox = new google.maps.places.SearchBox(inputStart)
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputStart)

    var inputEnd = document.getElementById('endLocation')
    var endSearchBox = new google.maps.places.SearchBox(inputEnd)

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      startSearchBox.setBounds(map.getBounds())
      endSearchBox.setBounds(map.getBounds())
    });
    startMarker = []
    endMarker = []

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    startSearchBox.addListener('places_changed', function() {
      var startPlaces = startSearchBox.getPlaces();

      if (startPlaces.length == 0) {
        return;
      }

      // Clear out the old markers.
      startMarker.forEach(function(startMarker) {
        startMarker.setMap(null);
      });
      startMarker = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      startPlaces.forEach(function(startPlace) {
        if (!startPlace.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: startPlace.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        startMarker.push(new google.maps.Marker({
          map: map,
          title: startPlace.name,
          position: startPlace.geometry.location
        }));
        map.setCenter(startMarker[0].getPosition())

        if (startPlace.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(startPlace.geometry.viewport);
        } else {
          bounds.extend(startPlace.geometry.location);
        }
      });

      map.fitBounds(bounds);
    });

    endSearchBox.addListener('places_changed', function() {
      var endPlaces = endSearchBox.getPlaces();

      if (endPlaces.length == 0) {
        return;
      }

      // Clear out the old markers.
      endMarker.forEach(function(endMarker) {
        endMarker.setMap(null);
      });
      endMarker = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      endPlaces.forEach(function(endPlace) {
        if (!endPlace.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: endPlace.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        if (startMarker[0] != null){
            console.log("startMarker[0].getPosition().lat(): "+startMarker[0].getPosition().lat());
            console.log("startMarker[0].getPosition().lng(): "+startMarker[0].getPosition().lng());
            console.log("endPlace.geometry.location.lat(): "+endPlace.geometry.location.lat());
            console.log("endPlace.geometry.location.lng(): "+endPlace.geometry.location.lng());
            centerPt = (getMidPoint(startMarker[0].getPosition(), endPlace.geometry.location))
            console.log("centerPt.lat(): " + centerPt.lat())
            console.log("centerPt.lng(): " + centerPt.lng())
            map.setCenter(centerPt)
        }
        // Create a marker for each place.
        endMarker.push(new google.maps.Marker({
          map: map,
          title: endPlace.name,
          position: endPlace.geometry.location
        }));
        /*
        if (startMarker.length != 0){
            map.setCenter(getMidPoint(startMarker[0].getPosition(), endMarker[0].getPosition()))
        }
        */

        if (endPlace.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(endPlace.geometry.viewport);
        } else {
          bounds.extend(endPlace.geometry.location);
        }
      });

      map.fitBounds(bounds);
    });
}

function getStart(){
    var retArr = new Array(2)
    retArr[0] = startMarker[0].getPosition().lat()
    retArr[1] = startMarker[0].getPosition().lng()
    return retArr
}

function getEnd(){
    var retArr = new Array(2)
    retArr[0] = endMarker[0].getPosition().lat()
    retArr[1] = endMarker[0].getPosition().lng()
    return retArr
}

function get

/**
 * This function returns an array of size 3 holding the following vars in the
 * specified order:
 *
 * centerPtLat
 * centerPtLng
 * radius
 */

function getCenterRadius(){
    var retArr = new Array(3)
    retArr[0] = centerPt.lat()
    retArr[1] = centerPt.lng()

    var R = 6371e3; // metres
    var φ1 = startMarker[0].getPosition().lat().toRadians();
    var φ2 = endMarker[0].getPosition().lat().toRadians();
    var Δφ = (startMarker[0].getPosition().lat()-endMarker[0].getPosition().lat()).toRadians();
    var Δλ = (startMarker[0].getPosition().lng() - endMarker[0].getPosition().lng()).toRadians();

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var radius = R * c
    if (radius < 50){
        radius = 50
    }
    retArr[2] = radius
    return retArr
}

/**
 * This function removes all markers from the map and renders it view-only.
 */

function changeMapMode(){
    clearMarkers()
    map.setOptions('disableDefaultUI', false)
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markers.push(marker);
}

function clearMarkers() {
    for (i = 0 ; i < startMarker.length ; i++){
        startMarker[i].setMap(null)
    }
    for (j = 0 ; j < endMarker.length ; j++){
        endMarker[j].setMap(null)
    }
    startMarker = []
    endMarker = []
}

function getMidPoint(loc1, loc2){
    var midLat = (1000000 * loc1.lat() + 1000000 * loc2.lat()) * 0.5 / 1000000
    var midLng = (1000000 * loc1.lng() + 1000000 * loc2.lng()) * 0.5 / 1000000
    var midPt = new google.maps.LatLng(midLat, midLng)
    return midPt
}
