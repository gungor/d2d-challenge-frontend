export function drawVehicles(map,mapboxgl,document,markers,vehicleList,turf){
	clearMarkers(markers);
	let features = collectVehicleLocations(vehicleList, turf);
	addMarkers(map,mapboxgl,document,markers,features);
}

function addMarkers(map,mapboxgl,document,markers,features){
	features.forEach(function(marker) {
	    // create a HTML element for each feature
	    var el = document.createElement('div');
		if( map.getZoom() > 11.4  ){
			if( marker.geometry.angle != null ){
				el.className = 'marker-direction';
			}else{
				el.className = 'marker-zoomed';
			}
		}else{
			el.className = 'marker';
		}
	    
	    var newMarker = new mapboxgl.Marker(el)
			.setLngLat(marker.geometry.coordinates);
			
		if( marker.geometry.angle != null  ){
			newMarker.setRotation(marker.geometry.angle);	
		}
		
		newMarker.addTo(map);
			
		markers.push(newMarker);
	});
}

function collectVehicleLocations(vehicles, turf){
	let features = [];
	
	for(var i = 0; i < vehicles.length; i++) {
		var vehicle = vehicles[i];
		var angle = null;
		if( vehicle.locations.length > 1 ){
			var point1 = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [vehicle.locations[0].lng , vehicle.locations[0].lat ]
				}
			};
			var point2 = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [vehicle.locations[1].lng , vehicle.locations[1].lat ]
				}
			};
			angle = turf.bearing(point2, point1);	
		}
		
		var feature = {
			'type': 'Feature',
			'geometry': {
				'type': 'Point',
				'coordinates': [vehicle.locations[0].lng , vehicle.locations[0].lat ],
				'angle' : angle
			}
		}
		
		features.push(feature);
	}
	return features;
}

function clearMarkers(markers){
	if (markers !== null) {
		for (var i = markers.length - 1; i > -1; i--) {
			markers[i].remove();
		}
		markers = [];
	}
}
			