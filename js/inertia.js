/*                                                                                        
 *        __________    ______    ________   _________   ______    ______                      
 *       /\   _   _ \  /\  __ \  /\___  __\ /\___  ___\ /\   _ \  /\  __ \                       
 *       \ \ \/\ \/\ \ \ \ \/\ \ \/__/\ \_/ \/__/\ \__/ \ \ \/\ \ \ \ \/\ \                     
 *        \ \ \ \ \ \ \ \ \ \_\ \    \ \ \     _\_\ \___ \ \ \_\ \ \ \ \ \ \                     
 *         \ \_\ \_\ \_\ \ \_____\    \ \_\   /\________\ \ \_____\ \ \_\ \ \                  
 *          \/_/\/_/\/_/  \/_____/     \/_/   \/________/  \/_____/  \/_/\/_/                 
 *  ______   _________    ______   __    _    ______    _______    ______    ______              
 * /\  ___\ /\___  ___\ /\  ____\ /\ \  | |  /\   _ \  /\  ____\  /\  ___\  /\  ___\              
 * \ \ \__/ \/__/\ \__/ \ \ \___/ \ \ \_| |  \ \ \/\ \ \ \ \___/  \ \ \__/  \ \ \__/            
 *  \ \__ \     \ \ \    \ \ \     \ \   _ \  \ \ \ \ \ \ \  ___\  \ \__  \  \ \__  \             
 *   \/__\ \    _\_\ \___ \ \ \____ \ \ \/\ \  \ \ \ \ \ \ \ \__/_  \/_/\  \  \/_/\  \            
 *    /\____\  /\________\ \ \_____\ \ \_\ \_\  \ \_\ \_\ \ \_____\  /\_____\  /\_____\         
 *    \/____/  \/________/  \/_____/  \/_/\/_/   \/_/\/_/  \/_____/  \/_____/  \/_____/
 *
 *                                     ~BY XAN MEAD~
 *
 */

var map;
var marker;
var elvSrv;

$(function() {
	initializeMap();

	// Catches geonames search form submission and performs query
	$('.geonames-search').submit(function(event) {
		var place = $(this).find("input[name='placename']").val();
		queryGeoNames(place);
	});

	// Catches submission of location data and processes it
	$('.location-info').submit(function(event) {
		// get pertinent information
		var lat = $(this).find("input[name='lat']").val();
		var elv = $(this).find("input[name='elv']").val();

		// Check for emptiness
		if (lat == "" || elv == "") {
			alert("Please select a location first.");
		}
		else {
			lat = parseFloat(lat);
			elv = parseFloat(elv);

			// Run and post calculations
			processLocation(lat, elv);
		}
	});

	google.maps.event.addListener(map, 'click', function(e) {
		// clear irrelevant search
		$("input[name='placename'").val("");
		setMarker(e.latLng);
		propagatePlace(e.latLng);
	});

	elvSrv = new google.maps.ElevationService();

});

function initializeMap() {
	var mapOptions = {
		center: {lat: 0, lng: 0},
		zoom: 2,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		streetViewControl: false
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

/* Move the marker to the lat/lng specified in loc */
function setMarker(loc) {
	if (marker != null) {
		marker.setMap(null);
	}
	map.panTo(loc);
	marker = new google.maps.Marker({
		position: loc,
		map: map,
		animation: google.maps.Animation.DROP
	});
}

/* Uses Google Maps Elevation Service to find elevation at location,
 * then populates the location-info fields with that information. */
function propagatePlace(coords) {
	// Post elevation data
	queryElevationService(coords);

	// Populate location-info fields
	$("input[name='lat']").val(coords.lat());
	$("input[name='lng']").val(coords.lng());
}

/* Queries the GeoNames search endpoint, and returns the results. */
function queryGeoNames(query) {
	var request = {
		q: query,
		maxRows: 5,
		username: "xanmead"
	}
	var result = $.ajax({
		url: "http://api.geonames.org/searchJSON",
		data: request,
		dataType: "jsonp",
		type: "GET"
	})
	.done(function(result) {
		if (result.totalResultsCount > 0) {
			var coords = getCoords(result);
			setMarker(coords);
			propagatePlace(coords);
			map.setZoom(15);
		}
		else {
			alert("GeoNames can't find \"" + query + "\"\nTry another spelling or look for it on the map.");
		}
	})
	.fail(function(jqXHR, error, errorThrown){
		console.log('ERROR: ' + error);
	});
}

/* Parses the coordinates from a raw GeoNames query result */
function getCoords(result) {
	// Focus first result
	var loc = result.geonames[0];
	// extract dimensions
	var lat = parseFloat(loc.lat);
	var lng = parseFloat(loc.lng);
	// Wrap in LatLng
	var coords = new google.maps.LatLng(lat, lng);
	return coords;
}

/* Queries the Google Maps Elevation Service for the specific location,
 * then returns the elevation. */
function queryElevationService(coords) {
	var answer;
	var locations = [];

	locations.push(coords);
	console.log(locations);

	// Create a LocationElevationRequest object using the array's one value
	var positionalRequest = {
		'locations': locations
	};

	console.log("posRequest: " + positionalRequest);

	// Initiate the location request
	elvSrv.getElevationForLocations(positionalRequest, function(results, status) {
		if (status == google.maps.ElevationStatus.OK) {
			// Retrieve the first result
			if (results[0]) {
				answer = results[0].elevation;
				$("input[name='elv']").val(Math.round(answer));
			} else {
				alert('No results found');
			}
		} else {
			alert('Elevation service failed due to: ' + status);
		}
	});
}

/* Calculates the velocity, then posts it to the DOM in various units. */
function processLocation(lat, elv) {
	// get velocity (in meters/second)
	var mps = calculateVelocity(lat, elv);

	// perform conversions
	var kph = mpsToKph(mps);
	var fps = mpsToFps(mps);
	var mph = mpsToMph(mps);
	var tss = mpsToTss(mps);

	// post results
	$('#mps').text(roundTo(mps, 2));
	$('#kph').text(roundTo(kph, 2));
	$('#fps').text(roundTo(fps, 2));
	$('#mph').text(roundTo(mph, 2));
	$('#tss').text(roundTo(tss, 2));
	$('.results').show();
}

/* Equatorial radius, in meters, with the (inaccurate, but useful) assumption that the earth is perfectly spherical */
var EARTH_RADIUS = 6371000;

function calculateVelocity(latitude, elevation) {
	// Find the hypotenuse, or distance from center of earth to object
	var coreDistance = EARTH_RADIUS + elevation;
	
	// Find the lateral leg, or distance from the polar axis to the object
	var axisDistance = coreDistance * Math.cos(degsToRads(latitude));
	
	// Find lateral circumference, or the distance the object will travel in one rotational period (24 hours)
	var periodDistance = 2 * Math.PI * axisDistance;
	
	// Divide by number of seconds in a day, to get meters/second
	var velocity = periodDistance / 86400;
	return velocity;
}

/* converts degrees to radians */
function degsToRads(degs) {
	return degs * (Math.PI/180);
}

/* rounds a number n to x decimal places */
function roundTo(n, x) {
	var f = Math.pow(10,x);
	return Math.round(n*f)/f;
}

/* meters/second -> feet/second */
function mpsToFps(mps) {
	// meters to feet
	var fps = mps * 3.281;
	return fps;
}

/* meters/second -> miles/hour */
function mpsToMph(mps) {
	// meters to miles
	var mph = mps * (1/1609);
	// seconds to hours
	mph *= 3600;
	return mph;
}

/* meters/second -> kilometers/hour */
function mpsToKph(mps) {
	// meters to kilometers
	var kph = mps * (1/1000);
	// second to hours
	kph *= 3600;
	return kph;
}

/* ratio of speed to speed of sound */
function mpsToTss(mps) {
	// divide by speed of sound
	return mps/343.59;
}