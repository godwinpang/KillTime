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
            origins: start,
            destinations: end,
            travelMode = 'WALKING',

        }, callback);

    function callback(response, status){
        if (status == 'OK'){
            var result = response.rows[0].elements
            var element = result[0]
            return element.duration.text
        } else {
            return -1;
        }
    }
}
