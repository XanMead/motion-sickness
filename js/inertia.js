/*                                                                                        
 *        __________    ______    ________   _________   ______    ______                      
 *       /\   _   _ \  /\  __ \  /\___  __\ /\___  ___\ /\   _ \  /\  __ \                       
 *       \ \ \/\ \/\ \ \ \ \/\ \ \/__/\ \_/ \/__/\ \__/ \ \ \/\ \ \ \ \/\ \                     
 *        \ \ \ \ \ \ \ \ \ \_\ \    \ \ \     _\_\ \___ \ \ \_\ \ \ \ \ \ \                     
 *         \ \_\ \_\ \_\ \ \_____\    \ \_\   /\________\ \ \_____\ \ \_\ \ \                  
 *          \/_/\/_/\/_/  \/_____/     \/_/   \/________/  \/_____/  \/_/\/_/                 
 *  ______   _________    ______   __    __   ______    _______    ______    ______              
 * /\  ___\ /\___  ___\ /\  ____\ /\ \  | |  /\   _ \  /\  ____\  /\  ___\  /\  ___\              
 * \ \ \__/ \/__/\ \__/ \ \ \___/ \ \ \_| |  \ \ \/\ \ \ \ \___/  \ \ \__/  \ \ \__/            
 *  \ \__ \     \ \ \    \ \ \     \ \   _ \  \ \ \ \ \ \ \  ___\  \ \__  \  \ \__  \             
 *   \/__\ \    _\_\ \___ \ \ \____ \ \ \/\ \  \ \ \ \ \ \ \ \__/_  \/__\  \  \/__\  \            
 *    /\____\  /\________\ \ \_____\ \ \_\ \_\  \ \_\ \_\ \ \_____\  /\_____\  /\_____\         
 *    \/____/  \/________/  \/_____/  \/_/\/_/   \/_/\/_/  \/_____/  \/_____/  \/_____/
 *
 *                                     ~BY XAN MEAD~
 *
 */

$(function() {
	initializeMap();
});

var STARTING_LOCATION = {lat: 44.590630, lng: -104.715540};

function initializeMap() {
	var mapOptions = {
		center: STARTING_LOCATION,
		zoom: 3
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};
	var map = new google.maps.Map($('#map-canvas'), mapOptions);
}

/* Equatorial radius, in meters, with the (inaccurate, but useful) assumption that the earth is perfectly spherical */
var EARTH_RADIUS = 6371000;

function calculateVelocity(latitude, elevation) {
	// Find the hypotenuse, or distance from center of earth to object
	var coreDistance = EARTH_RADIUS + elevation;
	
	// Find the lateral leg, or distance from the polar axis to the object
	var axisDistance = coreDistance * Math.asin(degsToRads(latitude));
	
	// Find lateral circumference, or the distance the object will travel in one rotational period (24 hours)
	var periodDistance = 2 * Math.pi * axisDistance;
	
	// Divide by number of seconds in a day, to get meters/second
	var velocity = periodDistance / 86400;
	return velocity;
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