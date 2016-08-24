console.log("js loaded");
initMap();
var policeStartLocation;
var endLocation;
var mapCenterLatLng;
var map;
var marker;
var airportLatLng;
var winner;
var distanceToAirport;
var criminalRandom;
var policeDistanceToHiest;
var policeRandom;
var jewelryStores = [];
var banks = [];
var policeStations = [];
var airports = [];
var criminalsRouteSetupInfo;
var policeRouteSetupInfo;
var panorama;

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
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.RIGHT_TOP
    },
    styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
  });
  
  var geocoder = new google.maps.Geocoder();
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
    // Once map is loaded...
    google.maps.event.addListenerOnce(map, 'idle', function(){
    // console.log("Map is loaded fully");
    getMapMarkers();
    heistLocation = false;
    endLocation = false;
    });    
  })

  function setupRouteForPolice(startPlace, callback) {
    console.log("Police station start point: " + startPlace.geometry.location);
    var policeStation = startPlace.geometry.location
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
    console.log("waypoints", waypoints);
    var speed = 90;
    var image = "../images/policecar.png";
    var color = "#FF0000";
    // getDirectionsAndDisplay(policeDirectionsService, policeDirectionsDisplay, policeStation, airportLatLng, waypoints, speed, image, color);
    // console.log("route info for police: ", { directionService: policeDirectionsService, directionDisplay: policeDirectionsDisplay, origin: policeStation, destination: airportLatLng, waypoints: waypoints, speed: speed, image: image, color: color});
    policeRouteSetupInfo = { directionService: policeDirectionsService, directionDisplay: policeDirectionsDisplay, origin: policeStation, destination: airportLatLng, waypoints: waypoints, speed: speed, image: image, color: color};
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
        var speed = 100;
        var image = "../images/criminal_car.png";
        var color = '#0000FF';
        criminalsRouteSetupInfo = { directionService: airportDirectionService, directionDisplay: airportDirectionDisplay, origin: heistLocation, destination: airportLatLng, waypoints: waypoints, speed: speed, image: image, color: color };
        callback();
      }
    });    
  }
  function clearMarkers(markers) {
    console.log(markers);
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
    // var request3 = {
    //   location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
    //   // radius: '15000',
    //   rankBy : google.maps.places.RankBy.DISTANCE,
    //   type: 'airport'
    // };
    // Police
    var request4 = {
      location: { lat: map.getCenter().lat(), lng: map.getCenter().lng() },
      radius: '8000',
      type: 'police'
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, mapMarkers);
    service.textSearch(request2, mapMarkers);
    // service.textSearch(request3, mapMarkers);
    service.textSearch(request4, mapMarkers);
  }
  function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        // var marker = new google.maps.Marker({
        //   map: resultsMap,
        //   position: results[0].geometry.location
        // }); Creating marker for geocode search result.
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
    var request = {
      location: heistLocation,
      rankBy: google.maps.places.RankBy.DISTANCE,
      types: ['police']
    };
    policeService = new google.maps.places.PlacesService(map);
    policeService.nearbySearch(request, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log("police search results" + results[0]);
        console.log(results[0]);
        return callback(results[0]);
      } else {
        console.log("Bad search");
      }
    });
  }
  function findNearestAirport(heistLocation, callback) {
    console.log("HeistLocation" + heistLocation);
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
        console.log("Bad search for police station...");
      }
    });
  }
  function heistMarkerListener(marker) {
    marker.addListener('click', function(event) {
      if (!heistLocation) {
        heistLocation = event.latLng;
        console.log('Start selected', event.latLng.lat(), event.latLng.lng());
        findNearestAirport(heistLocation, function(airport) {
          setupRouteForCriminals(function(){
            findNearestPoliceStation(heistLocation, function(pigShop) {
              setupRouteForPolice(pigShop, function() {
                console.log("route info for police: ", policeRouteSetupInfo);
                console.log("route info for criminals: ", criminalsRouteSetupInfo);

                getDirectionsAndDisplay(criminalsRouteSetupInfo, function() {
                  getDirectionsAndDisplay(policeRouteSetupInfo, function() {
                    console.log(criminalsRouteSetupInfo.routeDistance);
                    console.log(policeRouteSetupInfo.routeDistance);      
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
  function animateRoute(map, pathCoords, speed, image, color) {
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
    
    marker=new google.maps.Marker({map:map, icon:image});
    for (i = 0; i < pathCoords.length; i++) {       
      setTimeout(function(coords) {
        route.getPath().push(coords);
        moveMarker(map, marker, coords);
      }, speed * i, pathCoords[i]);
    }
  }

  function gameLogic() {
    var criminalEstimate = Math.ceil((((criminalsRouteSetupInfo.routeDistance)/1000)/80)*60);
    $(".criminal-estimate").html("You are about " +criminalEstimate + " minutes away.");
    var policeEstimate = Math.ceil((((policeRouteSetupInfo.routeDistance)/1000)/90)*60);
    $(".police-estimate").html("The police are about " +policeEstimate + " minutes way");

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
      console.log("You are " + (Math.floor(criminalTime*60)) + " minutes away and " + criminalSeconds + " seconds away!");
      $(".criminal-time-tag").html("<p>You make it to the airport in " + (Math.floor(criminalTime*60)) + " minutes and " + criminalSeconds + " seconds!</p>");
      
      var policeTime = ((policeRouteSetupInfo.routeDistance)/1000)/(90*policeRandom);
      //minutes = policeTime*60 remainder is seconds in decimal
      var policeRemainder = (policeTime*60) - (Math.floor(policeTime*60))
      var policeSeconds = (Math.floor(policeRemainder*60))
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
      animateRoute(map, criminalsRouteSetupInfo.route.routes[0].overview_path, criminalsRouteSetupInfo.speed, criminalsRouteSetupInfo.image, criminalsRouteSetupInfo.color);
      animateRoute(map, policeRouteSetupInfo.route.routes[0].overview_path, policeRouteSetupInfo.speed, policeRouteSetupInfo.image, policeRouteSetupInfo.color);

    })
  }

  function totalDistance(route, routeSetupInfo) {
    var total= 0;
    for (i = 0; i < route.legs.length; i++) {
      total += route.legs[i].distance.value;
    }
    console.log("Total Distance to airport: " + total + "m");
    routeSetupInfo.routeDistance = total;
  }

  function getDirectionsAndDisplay(routeSetupInfo, callback) {
    console.log("route setup info: ", routeSetupInfo);
    console.log("getting directions", routeSetupInfo.origin, routeSetupInfo.destination);
    var request = {
      origin: routeSetupInfo.origin,
      destination: routeSetupInfo.destination,
      waypoints: routeSetupInfo.waypoints,
      travelMode: google.maps.TravelMode.DRIVING
    };
    routeSetupInfo.directionService.route(request, function(result, status) {
      console.log("result and status", result, status);
      if (status == google.maps.DirectionsStatus.OK) {
          console.log("this is the request", request);
          routeSetupInfo.directionDisplay.setDirections(result);
          console.log("Time to get to airport: " + result.routes[0].legs[0].duration.value);

          totalDistance(result.routes[0], routeSetupInfo);
          routeSetupInfo.route = result;
          // animateRoute(map, result.routes[0].overview_path, routeSetupInfo.speed, routeSetupInfo.image, routeSetupInfo.color);
          console.log("route property of directionsService", routeSetupInfo.directionService);
          return callback();
        } else {
          window.alert('Directions request failed due to '+ routeSetupInfo.image + status);
      }
    });    
  }
}