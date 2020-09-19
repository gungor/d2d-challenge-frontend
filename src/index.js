import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibmVkZW5lbWUiLCJhIjoiY2tmNXhiYjJyMHI1ZzJxbnk0aWxkbHU2NyJ9.pJUZ9n_xkffXL_tcwsSGyQ';

var markers = [];

var serviceUrl = process.env.REACT_APP_SERVICE_URL;


class Application extends React.Component {
  constructor(props) {
  super(props);
    this.state = {
      lng: 13.403,
      lat: 52.53,
      zoom: 10
    };
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });
	
	// refers to drag
	map.on('moveend', () => {
      console.log("move ended");
    });
	
	map.on('load', function () {
		console.log('onload worked');
		
		window.setInterval(function () {
            
			fetch( serviceUrl+'/vehicles/54/15/52/12')
			.then(res => res.json())
			.then((data) => {
				
			
				
				if (markers !== null) {
					for (var i = markers.length - 1; i > -1; i--) {
					  markers[i].remove();
					}
					markers = [];
				}
				
				console.log(data.vehicleList);
				let vehicles = data.vehicleList;
				
				
				let features = [];
				
				for(var i = 0; i < vehicles.length; i++) {
					var vehicle = vehicles[i];
					
					features.push(  
						{
							'type': 'Feature',
							'geometry': {
								'type': 'Point',
								'coordinates': [vehicle.locations[0].lng , vehicle.locations[0].lat]
							}
						}
					);
				}
				
				features.forEach(function(marker) {

				    // create a HTML element for each feature
				    var el = document.createElement('div');
				    el.className = 'marker';

				    console.log(marker.geometry.coordinates);
				    // make a marker for each feature and add to the map
				    marker = new mapboxgl.Marker(el)
						.setLngLat(marker.geometry.coordinates)
						.addTo(map);
					markers.push(marker);
				});
				
				//map.triggerRepaint();
				
			})
			.catch(console.log)
			
         }, 200);
		
	        
    });
	
  }

  render() {
    return (
      <div>
        <div ref={el => this.mapContainer = el} className='mapContainer' />
      </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));