var places = [[33.649833, -117.838715], [33.655549, -117.837170], [33.649833, -117.830647], [33.650119, -117.836827]]

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
    setDirectionsService()
    var start = new google.maps.LatLng(startLng, startLat)
    var end = new google.maps.LatLng(destLng, destLat)
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
        {
            origins: [start],
            destinations: [end],
            travelMode : google.maps.TravelMode["WALKING"]

        }, callback);
    //TODO CLEAN UP THIS MESS
    function callback(response, status){
        if (status == 'OK'){
            var origins = response.originAddresses
            var destinations = response.destinationAddresses

            var result = response.rows[0].elements
            var element = result[0]
            var duration = element.duration.value
            var distance = element.distance.text
            var from = origins[0]
            var to = destinations[0]
            console.log("duration: " + duration)

        }
    }
}

/**
 * This function takes in a 2D array of integers corresponding to longitudinal
 * and latitude. The 2D array is sorted so that it corresponds to the actual
 * order of places to be visited.
 */

function getMapFromPlaces(directionsService, directionsDisplay, places){
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

/**
 * This function takes in an array storing the longitude latitude pair of where
 * the map should be centered around. It then initializes a map for the map.
 */

function initMap(){
    var directionsDisplay = new google.maps.DirectionsRenderer
    var directionsService = new google.maps.DirectionsService
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 33.653334, lng: -117.839316}
    })
    directionsDisplay.setMap(map)
    getMapFromPlaces(directionsService, directionsDisplay, places)
}
