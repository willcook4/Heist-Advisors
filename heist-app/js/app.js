var mapCenterLatLng;
var map;

function initMap() {
  // Create a default landing map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 51.515081, lng: -0.071966}
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
    // Once map is loaded...
    google.maps.event.addListenerOnce(map, 'idle', function(){
      // console.log("Map is loaded fully");
      getMapMarkers();
    });    
  })
}

// Markers for banks etc
function getMapMarkers() {
    // banks
    var request = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'bank'
    };

    // jewelry_store
    var request2 = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'jewelry_store'
    };

    // Airports
    var request3 = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '15000',
      type: 'airport'
    };

    var request4 = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'police'
    };

    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, mapMarkers);
    service.textSearch(request2, mapMarkers);
    service.textSearch(request3, mapMarkers);
    service.textSearch(request4, mapMarkers);
}

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    // mapCenterLatLng = results[0].geometry.location;
  });
}


function mapMarkers(results, status) {
  
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      
      if (place.types.includes("bank")) {
        createMarker(results[i], "bank");

      } else if(place.types.includes("jewelry_store")) {
        createMarker(results[i], "jewelry_store");
      
      } else if(place.types.includes("airport")) {
        createMarker(results[i], "airport");
      
      } else if(place.types.includes("police")) {
        createMarker(results[i], 'police');
        console.log('police: ' + results[i].name); 
      
      } else {
      }
    } 
  }
}

function createMarker(searchResult, type) {

  // var color = type === "bank" ? "yellow" : 'jewelry_store' ? "red" : 'airport' ? "blue" }
  var color;
  // Marker Color Selection
  // bank = yellow, jewelry_store = red, police = green, airport = blue
  if(type === 'bank') {
    color = 'yellow';
  }
  else if (type === 'jewelry_store'){
    color = 'red';
  } else if (type === 'police') {
    color = 'green';
  } else {
    // airport
    color = 'blue';
  }

  var marker = new google.maps.Marker({
    position: searchResult.geometry.location,
    map: map,
    // animation: google.maps.Animation.BOUNCE,
    icon: "http://maps.google.com/mapfiles/ms/icons/" + color + "-dot.png"
  });
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("js loaded");
  initMap();
});