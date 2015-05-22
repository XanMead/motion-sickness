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

$(function() {
	initializeMap();

	// Catches geonames search form submission and performs query
	$('.geonames-search').submit(function(event) {
		var place = $(this).find("input[name='placename']").val();
		propagatePlace(place);
	});

	// Catches submission of location data and processes it
	$('.location-info').submit(function(event) {
		var lat = $(this).find("input[name='lat']").val();
		var elv = $(this).find("input[name='elv']").val();
		if (lat == "" || elv == "") {
			alert("Please select a location first.");
		}
		else {
			lat = parseFloat(lat);
			elv = parseFloat(elv);
			processLocation(lat, elv);
		}
	});


});

function initializeMap() {
	var mapOptions = {
		center: {lat: 0, lng: 0},
		zoom: 0,
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
	marker = new google.maps.Marker({
		position: loc,
		map: map,
		animation: google.maps.Animation.DROP
	});
}

/* Uses GeoNames and Google Maps Elevation Service to find location and elevation,
 * then populates the location-info fields with that information. */
function propagatePlace(geoQuery) {
	// query GeoNames
	var result = queryGeoNames(geoQuery);
	if (result.totalResultsCount == 0) {
		alert("No results found!");
		return false;
	}

	// Focus first result
	result = result.geonames[0];
	var coords = {
		lat: parseFloat(result.lat),
		lng: parseFloat(result.lng)
	};
	var elv = queryElevationService(coords);
	elv = Math.round(elv);

	// Center map and mark it
	map.setCenter(coords);
	setMarker(coords);

	// Populate location-info fields
	$("input[name='lat']").val(coords.lat);
	$("input[name='lng']").val(coords.lng);
	$("input[name='elv']").val(elv);
}

/* Queries the GeoNames search endpoint, and returns the results. */
function queryGeoNames(query) {

}

/* Queries the Google Maps Elevation Service for the specific location,
 * then returns the elevation. */
function queryElevationService(coords) {

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