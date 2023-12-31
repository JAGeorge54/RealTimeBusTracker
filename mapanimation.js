let map;
let markers = [];

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  addMarkers();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat:42.36,lng:-71.10},
    zoom: 14,
  });

  
}

// Add bus markers to map
async function addMarkers(){
	//assigns json(bus information) to locations
	var locations = await getBusLocations();

	// loop through data, add bus markers
	locations.forEach(function(bus){
		var marker = getMarker(bus.id);		
		if (marker){
			moveMarker(marker,bus);
		}
		else{
			addMarker(bus);			
		}
	});

	// timer
	console.log(new Date());
	setTimeout(addMarkers,15000);
	console.log(locations);
}

//pull and assign data from MBTA
async function getBusLocations(){
    let url = 'https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=1&include=trip';	
	let response = await fetch(url);
	let json     = await response.json();
	return json.data;
}

// sets marker and icon
function addMarker(bus){
    let icon = getIcon(bus);
    //sett attributes to variables
    let nextStop = "Next Stop: " + (bus.attributes.current_stop_sequence + 1);
    let occupancy = "Occupancy:" + "<br>" + bus.attributes.occupancy_status;
    let busNumber = "Bus: " + bus.id;
    //add variables to content window
    let contentString = "<h4>" + busNumber + "<br>" + nextStop + "<br>" + "<br>" + occupancy + "<h4>";
    //adds marker to map
    let marker = new google.maps.Marker({
        position: {
            lat: bus.attributes.latitude, 
	    	lng: bus.attributes.longitude 
        },
        map: map,
        icon: icon,
        id: bus.id
    });
    //added info window
    let infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    //adds listener to open info window
    marker.addListener('click', function(){
        infowindow.open(map, marker);
    })
    markers.push(marker);
}

function getIcon(bus){
    //select icon 0 = north(red), 1 = south(blue)
    if (bus.attributes.direction_id ===0) {
        return './images/red.png';
    }
    return './images/blue.png'
}

function moveMarker(marker,bus) {
    //changes icon if bus changes direction north(red), 1 = south(blue)
    let icon = getIcon(bus);
    marker.setIcon(icon);

    //updates lat/lng of marker
    marker.setPosition( {
    	lat: bus.attributes.latitude, 
    	lng: bus.attributes.longitude
	});
}

function getMarker(id){
    let marker = markers.find(function(item){
        return item.id === id;
    });
    return marker;
}

window.onload = initMap;