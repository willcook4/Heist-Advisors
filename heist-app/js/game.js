console.log("js loaded");
initMap();
var airportLatLng;
var jewelryStores = [];
var banks = [];
var policeStations = [];
var airports = [];
var criminalsRouteSetupInfo;
var policeRouteSetupInfo;
var currentMarker;
var routeStats;
var winner; 

function initMap() {
  console.log("initializing");
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var policeDirectionsService = new google.maps.DirectionsService();
  var policeDirectionsDisplay;
  var airportDirectionsService = new google.maps.DirectionsService();
  var airportDirectionsDisplay;
  // Create a map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 51.515081, lng: -0.071966},
    mapTypeControl: false,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    styles: [
      {"featureType":"all", "elementType":"labels.text.fill", "stylers":[{"color":"#ffffff"}]}, {"featureType":"all", "elementType":"labels.text.stroke", "stylers":[{"color":"#000000"}, {"lightness":13}]}, {"featureType":"administrative", "elementType":"geometry.fill", "stylers":[{"color":"#000000"}]}, {"featureType":"administrative", "elementType":"geometry.stroke", "stylers":[{"color":"#144b53"}, {"lightness":14}, {"weight":1.4}]}, {"featureType":"landscape", "elementType":"all", "stylers":[{"color":"#08304b"}]}, {"featureType":"poi", "elementType":"geometry", "stylers":[{"color":"#0c4152"}, {"lightness":5}]}, {"featureType":"road.highway", "elementType":"geometry.fill", "stylers":[{"color":"#000000"}]}, {"featureType":"road.highway", "elementType":"geometry.stroke", "stylers":[{"color":"#0b434f"}, {"lightness":25}]}, {"featureType":"road.arterial","elementType":"geometry.fill", "stylers":[{"color":"#000000"}]}, {"featureType":"road.arterial", "elementType":"geometry.stroke", "stylers":[{"color":"#0b3d51"}, {"lightness":16}]}, {"featureType":"road.local", "elementType":"geometry", "stylers":[{"color":"#000000"}]}, {"featureType":"transit", "elementType":"all", "stylers":[{"color":"#146474"}]}, {"featureType":"water", "elementType":"all","stylers":[{"color":"#021019"}]}
      ]});

  var autocomplete = new google.maps.places.Autocomplete(( document.getElementById('address')), { types: ['(cities)']});
  
  var geocoder = new google.maps.Geocoder();
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
    // Once map is loaded...
    google.maps.event.addListenerOnce(map, 'idle', function(){
    getMapMarkers();
    heistLocation = false;
    });    
  })

  function setupRouteForPolice(nearestPoliceStationLatLng, callback) {
    console.log("Police station start point: " + nearestPoliceStationLatLng);
    policeDirectionsService = new google.maps.DirectionsService();
    policeDirectionsDisplay = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: "#FFFFFF",
        strokeOpacity: .4,
        strokeWeight: 5,
        zIndex: 20
      }
    });
    policeDirectionsDisplay.setMap(map);
    policeDirectionsDisplay.setOptions({
      preserveViewport: true
    });
    var waypoints = [{ location: heistLocation, stopover: false }];
    var image = "../images/policecar.png";
    var color = "#FF0000";
    policeRouteSetupInfo = { directionService: policeDirectionsService, directionDisplay: policeDirectionsDisplay, origin: nearestPoliceStationLatLng, destination: airportLatLng, waypoints: waypoints, image: image, color: color};
    return callback();
  }
  
  function setupRouteForCriminals(callback) {
    var airportLat;
    var airportLng;
    $.ajax({
      url: "https://airport.api.aero/airport/nearest/" + heistLocation.lat() + "/" + heistLocation.lng()+"?maxAirports=1&user_key=c6da13c45831bd2e3a96983d43065e7a",
      jsonp: "callback",
      dataType: "jsonp",
      success: function(data){
        airportLat = parseFloat(data.airports[0].lat);
        airportLng = parseFloat(data.airports[0].lng);
        airportLatLng = new google.maps.LatLng(airportLat, airportLng);
        console.log("Airport: " + airportLatLng);
        airportDirectionService = new google.maps.DirectionsService();
        airportDirectionDisplay = new google.maps.DirectionsRenderer({
          polylineOptions: {
            strokeWeight: 5,
            zIndex: 10
          }
        });
        airportDirectionDisplay.setMap(map);
        var waypoints = [];
        var image = "../images/criminal_car.png";
        var color = '#0000FF';
        criminalsRouteSetupInfo = { directionService: airportDirectionService, directionDisplay: airportDirectionDisplay, origin: heistLocation, destination: airportLatLng, waypoints: waypoints, image: image, color: color };
        callback();
      }
    });    
  }
  function clearMarkers(markers) {
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    return [];
  }
  function getMapMarkers() {
    jewelryStores = clearMarkers(jewelryStores);
    banks = clearMarkers(banks);
    policeStations = clearMarkers(policeStations);
    airports = clearMarkers(airports);
    var request = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'bank'
    };
    var request2 = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'jewelry_store'
    };
    var request4 = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'police'
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, mapMarkers);
    service.textSearch(request2, mapMarkers);
    service.textSearch(request4, mapMarkers);
  }
  function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
  function mapMarkers(results, status) {
    
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        var place = results[i];
        
        if (place.types.includes("bank")) {
          banks.push(createMarker(results[i], "bank"));
        } else if(place.types.includes("jewelry_store")) {
          jewelryStores.push(createMarker(results[i], "jewelry_store"));
        
        } else if(place.types.includes("airport")) {
          airports.push(createMarker(results[i], "airport"));
        
        } else if(place.types.includes("police")) {
          policeStations.push(createMarker(results[i], 'police'));
        } else {
        }
      } 
    }
  }

  function findNearestPoliceStation(heistLocation, callback) {
    var distances = [];
    
    for (i=0; i<policeStations.length; i++) {
      policeStationLatLng = new google.maps.LatLng({lat: policeStations[i].position.lat(), lng: policeStations[i].position.lng()});

      distanceAndPolice = ({ 
        distance: google.maps.geometry.spherical.computeDistanceBetween(policeStationLatLng , heistLocation), 
        nearestPoliceStation: policeStations[i] 
      });
      distances.push(distanceAndPolice);
    }
    distances = distances.sort(function(a, b) {
      return a.distance - b.distance;
    });
    nearestPoliceStationLatLng = new google.maps.LatLng({lat: distances[0].nearestPoliceStation.position.lat(), lng: distances[0].nearestPoliceStation.position.lng()});
    callback(nearestPoliceStationLatLng);    
  }

  function findNearestAirport(heistLocation, callback) {
    var request = {
      location: heistLocation,
      rankBy: google.maps.places.RankBy.DISTANCE,
      types: ['airport']
    };
    airportService = new google.maps.places.PlacesService(map);
    airportService.nearbySearch(request, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        return callback(results[0]);
      } else {
        console.log("Bad search for airport... (probably doesn't have one nearby)");
      }
    });
  }
  function heistMarkerListener(marker) {
    marker.addListener('click', function(event) {
      if (currentMarker !== undefined) {
        currentMarker.setAnimation(null);  
      }
      
      currentMarker = this;
      if(policeRouteSetupInfo !== undefined && criminalsRouteSetupInfo !== undefined) {
        policeRouteSetupInfo.directionDisplay.setMap(null);
        policeRouteSetupInfo = undefined;  
        criminalsRouteSetupInfo.directionDisplay.setMap(null);
        criminalsRouteSetupInfo = undefined;
      }
      heistLocation = undefined;
      if (!heistLocation) {
        heistLocation = event.latLng;
        findNearestAirport(heistLocation, function(airport) {
          setupRouteForCriminals(function(){
            findNearestPoliceStation(heistLocation, function(nearestPoliceStationLatLng) {
              setupRouteForPolice(nearestPoliceStationLatLng, function() {
                getDirectionsAndDisplay(criminalsRouteSetupInfo, function() {
                  getDirectionsAndDisplay(policeRouteSetupInfo, function() {    
                    gameLogic();
                  });
                });
              });
            });
          });
        });
      }


      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
          disableDefaultUI: true,
          fullscreenControl: true,
          position: heistLocation,
          pov: {
            heading: 34,
            pitch: 10
          }
        });
      map.setStreetView(panorama);
    });
  }
  function createMarker(searchResult, type) {
    var color;
    if(type === 'bank') {
      image = "../images/bank.png";
    } else if (type === 'jewelry_store'){
      image = "../images/jewelry.png";
    } else if (type === 'police') {
      image = "../images/police.png";
    } else {
      image = "../images/airport.png";
    }
    var marker = new google.maps.Marker({
      position: searchResult.geometry.location,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: image
    });
    if(type === 'bank' || type === 'jewelry_store') {
      heistMarkerListener(marker);  
    } 
    marker.addListener('click', toggleBounce);
    return marker;
    function toggleBounce() {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }
  }
  function moveMarker(map, marker, latlng) {
      marker.setPosition(latlng);
      // map.panTo(latlng);
  }
  function animateRoute(map, pathCoords, interval, image, color) {
    var i, route, marker;
    route = new google.maps.Polyline({
      path: [],
      geodesic : true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 10,
      editable: false,
      map: map
    });
    var pathCoordsLength = pathCoords.length
    marker=new google.maps.Marker({map:map, icon:image});
    for (i = 0; i < pathCoordsLength; i++) {       
      setTimeout(function(coords, index, pathCoordsLength, image) {
        route.getPath().push(coords);
        moveMarker(map, marker, coords);
        if (index === pathCoordsLength - 1 && !winner) {
          winner = true;
          updateWinscreenUi();
        }
      }, interval * i, pathCoords[i], i, pathCoordsLength, image);

    }
  }

  function gameLogic() {
    var criminalEstimate = Math.ceil((((criminalsRouteSetupInfo.routeDistance)/1000)/80)*60);
    $(".criminal-estimate").html("You are about " +criminalEstimate + " minutes away");
    var policeEstimate = Math.ceil((((policeRouteSetupInfo.routeDistance)/1000)/90)*60);
    $(".police-estimate").html("The police are about " +policeEstimate + " minutes away");

    var winPercent = Math.floor((policeEstimate/criminalEstimate)*100)-30
    var winPercentModifier = Math.floor((Math.random()*10))
    if(Math.random()<.49999){
     $(".win-percent").html((winPercent-winPercentModifier)+"%")
    } else {
     $(".win-percent").html(((winPercent-winPercentModifier)-10)+"%")
    }

    if((winPercent-winPercentModifier)<10){
      $(".win-money").html("$100 million");
    }else if((winPercent-winPercentModifier)<30){
      $(".win-money").html("$50 million");
    }else if((winPercent-winPercentModifier)<50){
      $(".win-money").html("$10 million");
    }else if((winPercent-winPercentModifier)<70){
      $(".win-money").html("$1 million");
    }else if((winPercent-winPercentModifier)<90){
      $(".win-money").html("$250 thousand");
    }else if((winPercent-winPercentModifier)<95){
      $(".win-money").html("$100 thousand");
    }else{
      $(".win-money").html("$10 thousand");
    }


    $(".rob").on("click", function(){
      policeRandom = ((Math.ceil(Math.random()*100))/100);
      while(policeRandom <= .75){
        policeRandom = ((Math.ceil(Math.random()*100))/100);
      }
      criminalRandom = ((Math.ceil(Math.random()*100))/100);
      while(criminalRandom <= .9){
        criminalRandom = ((Math.ceil(Math.random()*100))/100);
      }
      var criminalTime = ((criminalsRouteSetupInfo.routeDistance)/1000)/(80*criminalRandom);
      //minutes = policeTime*60 remainder is seconds in decimal
      var criminalRemainder = (criminalTime*60) - (Math.floor(criminalTime*60))
      var criminalSeconds = (Math.floor(criminalRemainder*60))

      var policeTime = ((policeRouteSetupInfo.routeDistance)/1000)/(90*policeRandom);
      //minutes = policeTime*60 remainder is seconds in decimal
      var policeRemainder = (policeTime*60) - (Math.floor(policeTime*60))
      var policeSeconds = (Math.floor(policeRemainder*60))

      var totalSecondsCriminal = ((Math.floor(criminalTime*60))*60) + criminalSeconds;
      var totalSecondsPolice = ((Math.floor(policeTime*60))*60) + policeSeconds;

      var criminalPathCoords = criminalsRouteSetupInfo.route.routes[0].overview_path;
      var policePathCoords = policeRouteSetupInfo.route.routes[0].overview_path;

      var animationTime = 20;

      var conversionToGameTime = totalSecondsPolice/animationTime;

      criminalsRouteSetupInfo.interval = ((totalSecondsCriminal/conversionToGameTime)/criminalPathCoords.length)*1000;
      policeRouteSetupInfo.interval = ((totalSecondsPolice/conversionToGameTime)/policePathCoords.length)*1000;
      routeStats = { criminalTime: criminalTime, criminalSeconds: criminalSeconds, policeTime: policeTime, policeSeconds: policeSeconds };

      animateRoute(map, criminalPathCoords, criminalsRouteSetupInfo.interval, criminalsRouteSetupInfo.image, criminalsRouteSetupInfo.color);
      animateRoute(map, policePathCoords, policeRouteSetupInfo.interval, policeRouteSetupInfo.image, policeRouteSetupInfo.color);

    })
  }

  function updateWinscreenUi() {
    var criminalTime = routeStats.criminalTime;
    var criminalSeconds = routeStats.criminalSeconds;
    var policeTime = routeStats.policeTime;
    var policeSeconds = routeStats.policeSeconds;

    $(".criminal-time-tag").html("<p>You make it to the airport in " + (Math.floor(criminalTime*60)) + " minutes and " + criminalSeconds + " seconds!</p>");
    

    $(".police-time-tag").html("<p>The police make it to the airport in " + (Math.floor(policeTime*60)) + " minutes and " + policeSeconds + " seconds!</p>");

    if(policeTime < criminalTime){
      //win
      $(".win-or-lose").html("<p>YOU HAVE BEEN CAUGHT</p>");
    } else if(criminalTime < policeTime){
      //lose
      $(".win-or-lose").html("<p>YOU GET AWAY WITH ALL THE CASH!</p>");
    } else if(policeTime = criminalTime){
      //meet the police
      $(".win-or-lose").html("<p>YOU MEET THE POLICE AT THE AIRPORT!</p>");
    } else {
      console.error("Something went wrong when determining who wins");
    }
  }

  function totalDistance(route, routeSetupInfo) {
    var total= 0;
    for (i = 0; i < route.legs.length; i++) {
      total += route.legs[i].distance.value;
    }
    routeSetupInfo.routeDistance = total;
  }

  function getDirectionsAndDisplay(routeSetupInfo, callback) {
    var request = {
      origin: routeSetupInfo.origin,
      destination: routeSetupInfo.destination,
      waypoints: routeSetupInfo.waypoints,
      travelMode: google.maps.TravelMode.DRIVING
    };
    routeSetupInfo.directionService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
          routeSetupInfo.directionDisplay.setDirections(result);
          totalDistance(result.routes[0], routeSetupInfo);
          routeSetupInfo.route = result;
          return callback();
        } else {
          window.alert('Directions request failed due to '+ routeSetupInfo.image + status);
      }
    });    
  }
}

