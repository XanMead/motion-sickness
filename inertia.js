/*                                                                                        
 *        __________    ______    ________   _________   ______    ______                      
 *       /\   _   _ \  /\  __ \  /\___  __\ /\___  ___\ /\   _ \  /\  __ \                       
 *       \ \ \/\ \/\ \ \ \ \/\ \ \/__/\ \   \/__/\ \__/ \ \ \/\ \ \ \ \/\ \                     
 *        \ \ \ \ \ \ \ \ \ \_\ \    \ \ \     _\_\ \__  \ \ \_\ \ \ \ \ \ \                     
 *         \ \_\ \_\ \_\ \ \_____\    \ \_\   /\_______\  \ \_____\ \ \_\ \ \                  
 *          \/_/\/_/\/_/  \/_____/     \/_/   \/_______/   \/_____/  \/_/\/_/                 
 *  ______   _________    ______    _    __   ______    _______    ______     ______              
 * /\  ___\ /\___  ___\ /\  ____\ /\ \  | |  /\   _ \  /\  ____\  /\  ___\  /\  ___\              
 * \ \ \__/ \/__/\ \__/ \ \ \___/ \ \ \_| |  \ \ \/\ \ \ \ \___/  \ \ \__/  \ \ \__/            
 *  \ \__ \     \ \ \    \ \ \     \ \   _ \  \ \ \ \ \ \ \  ___\  \ \__  \  \ \__  \             
 *   \/__\ \    _\_\ \__  \ \ \____ \ \ \/\ \  \ \ \ \ \ \ \ \__/_  \/__\  \  \/__\  \            
 *    /\____\  /\_______\  \ \_____\ \ \_\ \_\  \ \_\ \_\ \ \_____\  /\_____\  /\_____\         
 *    \/____/  \/_______/   \/_____/  \/_/\/_/   \/_/\/_/  \/_____/  \/_____/  \/_____/
                  
 *                                                                               
 *                                                                               
 *                                                                               
 *                                                                               
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
	};
	var map = new google.maps.Map($('#map-canvas'), mapOptions);
}

// Equatorial radius, with the (inaccurate, but useful) assumption that the earth is perfectly spherical
var EARTH_RADIUS;

function calculateVelocity(latitude, elevation) {
	// Find the hypotenuse, or distance from center of earth to object
	var coreDistance = EARTH_RADIUS + elevation;
	
	// Find the lateral leg, or distance from the polar axis to the object
	var axisDistance = coreDistance * Math.asin(degsToRads(latitude));
	
	// Find lateral circumference, or the distance the object will travel in one rotational period (24 hours)
	var periodDistance = 2 * Math.pi * axisDistance;
	
	// Return velocity, in meters/second
	return periodDistance / 86400;
}
