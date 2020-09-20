import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { drawVehicles } from './vehicle.js'

mapboxgl.accessToken = 'pk.eyJ1IjoibmVkZW5lbWUiLCJhIjoiY2tmNXhiYjJyMHI1ZzJxbnk0aWxkbHU2NyJ9.pJUZ9n_xkffXL_tcwsSGyQ';

var markers = [];
var serviceUrl = process.env.REACT_APP_SERVICE_URL;


class Application extends React.Component {
  constructor(props) {
  super(props);
    this.state = {
      lng: 13.403,
      lat: 52.53,
      zoom: 10,
	  vehicles: 0
    };
  }

  componentDidMount() {
	var that = this;  
	  
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });
	
	
    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
	
	
	map.on('moveend', () => {
	  
    });
	
	map.on('load', function () {
		
		setInterval(function () {
			
			let bounds = map.getBounds();
            
			fetch( serviceUrl+'/vehicles/'+bounds._ne.lat+'/'+bounds._ne.lng+'/'+bounds._sw.lat+'/'+bounds._sw.lng)
			//fetch( 'http://localhost:8080/vehicles/'+bounds._ne.lat+'/'+bounds._ne.lng+'/'+bounds._sw.lat+'/'+bounds._sw.lng)
			.then(res => res.json())
			.then((data) => {
				that.setState({
					lng: map.getCenter().lng.toFixed(4),
					lat: map.getCenter().lat.toFixed(4),
					zoom: map.getZoom().toFixed(2),
					vehicles: data.vehicleList.length
				});
				
				drawVehicles(map,mapboxgl,document,markers,data.vehicleList, turf);
			})
			.catch(console.log)
			
          }, 500);
    });
  }

  render() {
    return (
      <div>
	    <div className='sidebarStyle'>
			<div>Zoom     : {this.state.zoom}</div>
			<div>Vehicles : {this.state.vehicles}</div>
		</div>
        <div ref={el => this.mapContainer = el} className='mapContainer' />
      </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));