/* Geolocation module */

app.module('geolocation', function(geolocation, app, Backbone, Marionette, $) {

  // Threshholds and defaults
  var options = {
    enableHighAccuracy: true,  // effectiveness varies
    desiredAccuracy: 20,       // m
    warnableAccuracy: 76.2,    // m
    acceptableAccuracy: 152.4, // m
    timeout: 2000,             // ms
    maximumAge: 0              // ms
  },

  // Internal process indicator.
  isLocating = false,

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

      // Clear internal indicator.
      isLocating = false;

      // Clear watch and timeout.
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
    config.els.geolocation.container.removeClass('loading');

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

    // Send location data to main view.
    app.main.currentView.populateDistance(cache.stations);

    // Sort stations from closest to farthest.
    var sortedStations = _.sortBy(cache.stations, 'rank');

    // Show closest stations.
    showNearby(sortedStations);

  },

  positionError = function(pos) {

    // Hide loading indicator.
    config.els.geolocation.container.removeClass('loading');

    // Warn user if location is inaccurate.
    if(pos) {
      if(pos.coords.accuracy > options.acceptableAccuracy) {
        app.vent.trigger('messages:warn', 'Your location cannot be found within ' + Math.round(options.acceptableAccuracy * 3.28084) + ' ft.');
      } else if(pos.coords.accuracy > options.warnableAccuracy) {
        app.vent.trigger('messages:warn', 'Your location is accurate to about ' + Math.round(pos.coords.accuracy * 3.28084) + ' ft.');
      }
    } else {
      config.els.geolocation.container.slideUp();
      setLocalStorage('disable-geolocation', 'true');
      app.vent.trigger('messages:error', 'Could not determine your location.');
    }

  },

  // Process user selection from nearby stations.
  selectNearbyStation = function(e) {

    // Stop bubbling.
    e.stopPropagation();

    // Add station.
    var id = $(event.target).closest('p').data('oid');
    app.main.currentView.addStation(cache.stations[id]);

  },

  showNearby = function(stations) {

    // Add nearby station suggestions.
    $.each(stations, function(i, station) {
      if(i < 5 || station.rank < 0.25) {
        app.nearby.currentView.addStation(station);
      }
    });

  },

  // Attempt geolocation.
  geolocate = function() {

    if(navigator.geolocation && !isLocating) {

      if(getLocalStorage('disable-geolocation') === 'true') {

        // Show geolocation button.
        config.els.geolocation.button.show();

      } else {

        // Turn on internal indicator.
        isLocating = true;

        // Remove existing stations.
        app.nearby.currentView.collection.reset();

        // Adjust UI.
        config.els.geolocation.button.hide();
        config.els.geolocation.container.addClass('loading');
        config.els.geolocation.container.slideDown();

        // Get current position.
        getPosition(parsePosition, positionError);

      }

    }

  },

  retryGeolocation = function() {
    setLocalStorage('disable-geolocation', 'false');
    geolocate();
  },

  // Set local storage.
  setLocalStorage = function(key, value) {
    if(window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },

  // Get local storage.
  getLocalStorage = function(key) {
    return (window.localStorage) ? window.localStorage.getItem(key) : null;
  },

  // Disable geolacation by user request.
  disableGeolocation = function() {

    // Hide nearby stations, show button, and store decision.
    config.els.geolocation.container.slideUp();
    config.els.geolocation.button.show();
    setLocalStorage('disable-geolocation', 'true');

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
  },

  // Initialize geolocation features.
  initialize = function() {

    if(navigator.geolocation) {

      // Activate UI.
      config.els.api.button.on('click', geolocate);
      config.els.geolocation.button.on('click', retryGeolocation);
      config.els.geolocation.close.on('click', disableGeolocation);
      config.els.geolocation.main.on('click', selectNearbyStation);

      // Geolocate.
      geolocate();

    }

  };

  // Bind to events.
  app.vent.bind('geolocation:initialize', initialize);
  app.vent.bind('geolocation:update', geolocate);

});
