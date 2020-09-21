const detailedZoomLevel = 11.4;
const screenDistanceLimitForGroupingZoomed = 24;
const screenDistanceLimitForGrouping = 16;

export function drawVehicles(map,mapboxgl,document,markers,vehicleList,turf){
	clearMarkers(markers);
	let groups = groupVehicles(vehicleList,map);
	let features = convertGroupsToFeatures(map, groups, turf);
	addMarkers(map,mapboxgl,document,markers,features);
}

// groupVehicles should be optimized, inner loop for coordinate checking can be replaced
function groupVehicles(vehicleList,map){
	let screenDistanceLimit = screenDistanceLimitForGrouping;
	if( map.getZoom() > detailedZoomLevel ){
		screenDistanceLimit = screenDistanceLimitForGroupingZoomed;
	}
	let groups = [];
	for(var i=0; i<vehicleList.length; i++){
		let loc = vehicleList[i].locations[0];
		var point = map.project([loc.lng, loc.lat]);
		var member = false;
		for( var j=0; j<groups.length; j++ ){
			let group = groups[j];
			let screenCoordinates = group.screenCoordinates;
			for(var k=0; k< screenCoordinates.length; k++ ){
				if( Math.sqrt( Math.pow(screenCoordinates[k].x - point.x, 2) + Math.pow(screenCoordinates[k].y - point.y, 2) ) < screenDistanceLimit ){
					groups[j].screenCoordinates.push({x: point.x, y: point.y});
					groups[j].coordinates.push({lng: loc.lng, lat: loc.lat});
					member = true;
					break;
				}
			}
			if( member ){
				break;
			}
		}
		if( !member ){
			groups.push( {coordinates: [{lng: loc.lng, lat: loc.lat}] , 
						  screenCoordinates: [{x: point.x, y: point.y}] , 
						  locations: vehicleList[i].locations 
			});
		}
	}
	return groups;
}

function convertGroupsToFeatures(map, groups, turf){
	let features = [];
	for(var i = 0; i < groups.length; i++) {
		var group = groups[i];
		var angle = null;
		var markerClass;
		var latAvg = 0;
		var lngAvg = 0;
		
		if(  group.coordinates.length < 2  ){
			if( map.getZoom() > detailedZoomLevel ){
				markerClass = 'marker-zoomed';
			}else{
				markerClass = 'marker';
			}
			
			if( group.locations.length > 1 &&  map.getZoom() > detailedZoomLevel ){
				var point1 = generateFeature(group.locations[0].lng , group.locations[0].lat );
				var point2 = generateFeature(group.locations[1].lng , group.locations[1].lat );
				angle = turf.bearing(point2, point1);	
				markerClass = 'marker-direction';
			}
			latAvg = group.locations[0].lat;
			lngAvg = group.locations[0].lng;
		}else{
			markerClass = 'marker-grouped';
			for(var j=0; j<group.coordinates.length; j++){
				latAvg = latAvg + group.coordinates[j].lat;
				lngAvg = lngAvg + group.coordinates[j].lng;
			}	
			latAvg = latAvg / group.coordinates.length;
			lngAvg = lngAvg / group.coordinates.length;
		}
		
		var feature = generateFeature(lngAvg , latAvg );
		feature.geometry.angle = angle;
		feature.geometry.markerClass = markerClass;
		feature.geometry.vehicleCount = group.coordinates.length;
		
		features.push(feature);
	}
	return features;
}

function addMarkers(map,mapboxgl,document,markers,features){
	features.forEach(function(marker) {
	    // create a HTML element for each feature
	    var el = document.createElement('div');
		el.className = marker.geometry.markerClass;
		
		// this should change
		if( marker.geometry.markerClass == 'marker-grouped' ){
			el.style.background = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34'>"+
			"<circle cx='17' cy='17' r='17'  fill='none' stroke='rgb(255, 140, 0)' stroke-width='3' />"+
			"<text x='50%' y='50%' color='white' text-anchor='middle' font-size='12' font-family='Arial' dy='.3em' fill='rgb(255, 140, 0)' >"+
			marker.geometry.vehicleCount+
			"</text>"+
			
			"</svg>\")";
		}
		
	    var newMarker = new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates);
			
		if( marker.geometry.angle != null  ){
			newMarker.setRotation(marker.geometry.angle);	
		}
		
		newMarker.addTo(map);		
		markers.push(newMarker);
	});
}

function generateFeature(lng,lat){
	return {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [lng , lat ]
		}
	};
}

function clearMarkers(markers){
	if (markers !== null) {
		for (var i = markers.length - 1; i > -1; i--) {
			markers[i].remove();
		}
		markers = [];
	}
}
			