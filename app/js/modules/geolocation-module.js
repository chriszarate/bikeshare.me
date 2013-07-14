/* Geolocation module */

app.module('geolocation', function(api, app) {

  // Accuracy threshhold for location data.
  var accuracyThreshhold = 100,

  // Parse position returned from navigator.geolocation.
  parsePosition = function(position) {

    // Make sure it's accurate enough to be worth using.
    if(position.coords && typeof position.coords.accuracy === 'number' && position.coords.accuracy < accuracyThreshhold) {

      // Format coordinates for helper function.
      var coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Loop through stations and add location data.
      $.each(cache.stations, function(i, station) {
        station.rank = calculateDistance(station, coordinates);
        station.distance = formatDistance(station.rank);
      });

      // Send location data to existing views.
      app.main.currentView.populateDistance(cache.stations);

      // Reinitialize the autocomplete module with a sorted station list.
      app.vent.trigger('autocomplete:initialize', _.sortBy(cache.stations, 'rank'));
      app.vent.trigger('autocomplete:geolocate');

    } else {
      app.vent.trigger('messages:warn', 'Reported location data is too vague.');
    }

  },

  // Attempt geolocation.
  geolocate = function() {
    navigator.geolocation.getCurrentPosition(parsePosition);
  },

  // Initialize geolocation features.
  initialize = function() {
    if(navigator.geolocation) {
      $('#locate-link').on('click', geolocate);
      $('#locate').show();
    }
  },

  // Calculate distance between two points.
  calculateDistance = function(p1, p2) {

    /*
      By Andrew Hedges, andrew(at)hedges(dot)name
    */

    // radians = degrees * pi / 180
    var deg2rad = function(deg) {
      return deg * Math.PI / 180;
    },

    // mean radius of the earth at 39 degrees
    Rm = 3961,

    // convert coordinates to radians
    lat1 = deg2rad(p1.lat),
    lon1 = deg2rad(p1.lng),
    lat2 = deg2rad(p2.lat),
    lon2 = deg2rad(p2.lng),

    // find the differences between the coordinates
    dlat = lat2 - lat1,
    dlon = lon2 - lon1,

    // here's the heavy lifting
    a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2), 2),

    // great circle distance in radians
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),

    // great circle distance in miles
    dm = c * Rm;

    // round the results down to the nearest 1/1000
    return Math.round(dm * 1000) / 1000;

  },

  // Format the distance in conversational terms.
  formatDistance = function(distance) {
    if(distance <= 0.12) {
      // Round short distances to the nearest ten feet.
      return (Math.round(distance * 5280 / 10) * 10) + ' ft';
    } else if(distance < 1) {
      // Round distances less than a mile to the nearest tenth of a mile.
      return (Math.round(distance * 10) / 10) + ' mi';
    }
    return '';
  };

  // Bind to events.
  app.vent.bind('geolocation:initialize', initialize);

});
