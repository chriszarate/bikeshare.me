/* Geolocation module */

app.module('geolocation', function(geolocation, app, Backbone, Marionette, $) {

  var $link = $('#locate-link'),

  // Threshholds and defaults
  options = {
    enableHighAccuracy: true,  // effectiveness varies
    desiredAccuracy: 20,       // m
    warnableAccuracy: 76.2,    // m
    acceptableAccuracy: 152.4, // m
    timeout: 1000,             // ms
    maximumAge: 0              // ms
  },

  // Adapted from
  // https://github.com/gwilson/getAccurateCurrentPosition
  getPosition = function(success, error) {

    var fallback = false, eventCount = 0,

    checkLocation = function(pos) {

      // Ignore the first event because it's sometimes from cache.
      if(++eventCount > 0) {
        if(pos.coords.accuracy <= options.desiredAccuracy) {
          cancelWatch();
          success(pos);
        }
      }

      // Store last-checked position.
      fallback = pos;

    },

    stopTrying = function() {

      // Clear the watch.
      cancelWatch();

      // Use the last-checked position if it's acceptable.
      if(fallback && fallback.coords.accuracy < options.acceptableAccuracy) {
        success(fallback);
      }

      // Potentially warn the user of a level of inaccuracy.
      error(fallback);

    },

    cancelWatch = function() {
      navigator.geolocation.clearWatch(watchID);
      clearTimeout(timerID);
    },

    // Set timeouts that will abandon the location loop.
    watchID = navigator.geolocation.watchPosition(checkLocation, stopTrying, options),
    timerID = setTimeout(stopTrying, options.timeout);

  },

  // Parse position returned from navigator.geolocation.
  parsePosition = function(pos) {

    // Hide loading indicator.
    $link.removeClass('loading');

    // Format coordinates for helper function.
    var coordinates = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    // Loop through stations and add location data.
    $.each(cache.stations, function(i, station) {
      station.rank = calculateDistance(station, coordinates);
      station.distance = formatDistance(station.rank);
    });

    // Send location data to existing views.
    app.main.currentView.populateDistance(cache.stations);

    // Sort stations from closest to farthest.
    var sortedStations = _.sortBy(cache.stations, 'rank');

    // Reinitialize the autocomplete module with a sorted station list.
    app.vent.trigger('autocomplete:initialize', sortedStations);
    app.vent.trigger('autocomplete:geolocate', sortedStations);

  },

  positionError = function(pos) {

    // Hide loading indicator.
    $link.removeClass('loading');

    // Warn user if location is inaccurate.
    if(pos) {
      if(pos.coords.accuracy > options.acceptableAccuracy) {
        app.vent.trigger('messages:warn', 'Your location cannot be found within ' + Math.round(options.acceptableAccuracy * 3.28084) + ' ft.');
      } else if(pos.coords.accuracy > options.warnableAccuracy) {
        app.vent.trigger('messages:warn', 'Your location is accurate to about ' + Math.round(pos.coords.accuracy * 3.28084) + ' ft.');
      }
    } else {
      app.vent.trigger('messages:error', 'Could not determine your location.');
    }

  },

  // Attempt geolocation.
  geolocate = function(e) {
    $link.addClass('loading');
    getPosition(parsePosition, positionError);
    e.preventDefault();
    e.stopPropagation();
  },

  // Initialize geolocation features.
  initialize = function() {
    if(navigator.geolocation) {
      $link.on('click', geolocate).parent().show();
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
