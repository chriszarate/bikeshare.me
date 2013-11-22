/* Geolocation module */

app.module('geolocation', function(geolocation, app, Backbone, Marionette, $) {

  // Threshholds and defaults
  var options = {
    enableHighAccuracy: true,  // effectiveness varies
    desiredAccuracy: 20,       // m
    warnableAccuracy: 76.2,    // m
    acceptableAccuracy: 152.4, // m
    usefulRadius: 0.25,        // mi
    flexRadius: 5,             // mi
    timeout: 5000,             // ms
    maximumAge: 0              // ms
  },

  // Information, warnings, and error messages.
  messages = {
    standard: 'Nearby',
    unusable: 'Your location cannot be found within %str% ft.',
    inaccurate: 'Your location is accurate to about %str% ft.',
    tooDistant: 'You are %str% miles from the nearest station.',
    betterChoice: 'Switch to %str%?',
    error: 'Unable to find your location.',
    errorPermission: 'Permission to find your location was denied.',
    errorTimeout: 'The location request timed out.'
  },

  // Internal process indicator.
  isLocating = false,

  // Adapted from
  // https://github.com/gwilson/getAccurateCurrentPosition
  getPosition = function(success, error) {

    var fallback = false, eventCount = 0,

    checkLocation = function(pos) {

      // Ignore the first event because it's sometimes from cache.
      if(eventCount > 0) {
        if(pos.coords.accuracy <= options.desiredAccuracy) {
          cancelWatch();
          success(pos);
        }
      }

      // Increment event count.
      eventCount = eventCount + 1;

      // Store last-checked position.
      fallback = pos;

    },

    stopTrying = function(err) {

      // Clear the watch.
      cancelWatch();

      // Potentially warn the user of a level of inaccuracy.
      error(fallback, err);

      // Use the last-checked position if it's acceptable.
      if(fallback && fallback.coords.accuracy < options.acceptableAccuracy) {
        success(fallback);
      }

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

    // Format coordinates for helper function.
    geolocation.pos = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    // Hide loading indicator.
    config.els.geolocation.container.removeClass('loading');

    // Proceed when station data has been loaded.
    app.api.promise.then(function() {

      // Loop through stations and add location data.
      $.each(config.stations, function(i, station) {
        station.rank = calculateDistance(station, geolocation.pos);
        station.distance = formatDistance(station.rank);
      });

      // Send location data to main view.
      app.main.currentView.populateDistance(config.stations);

      // Sort stations from closest to farthest.
      var sortedStations = _.sortBy(config.stations, 'rank');

      // Show closest stations.
      showNearby(sortedStations);

    });

  },

  positionError = function(pos, err) {

    // Hide loading indicator.
    config.els.geolocation.container.removeClass('loading');

    // Warn user if location is inaccurate.
    if(pos) {
      if(pos.coords.accuracy > options.acceptableAccuracy) {
        showMessage(messages.unusable, mToFt(options.acceptableAccuracy));
      } else if(pos.coords.accuracy > options.warnableAccuracy) {
        showMessage(messages.inaccurate, mToFt(pos.coords.accuracy));
      }
    } else {
      // Show specific error messages.
      if(err && err.code) {
        switch(err.code) {
        case err.PERMISSION_DENIED:
          showMessage(messages.errorPermission);
          break;
        case err.TIMEOUT:
          showMessage(messages.errorTimeout);
          break;
        default:
          showMessage(messages.error);
          break;
        }
      } else {
        showMessage(messages.error);
      }
    }

  },

  // Process user selection from nearby stations.
  selectNearbyStation = function(e) {

    // Stop bubbling.
    e.stopPropagation();

    // Add station.
    var id = $(event.target).closest('p').data('oid');
    app.main.currentView.addStation(config.stations[id]);

  },

  showNearby = function(stations) {

    // Add nearby station suggestions.
    $.each(stations, function(i, station) {

      // If the nearest station is very far away, show a warning or suggest
      // another city.
      if(i === 0 && station.rank > options.flexRadius) {

        var foundCloserCity = false;

        // Loop through available cities.
        $.each(config.api, function(i, city) {

          var pos = {
            lat: convertE6(city.lat),
            lng: convertE6(city.lng)
          };

          // If this city is within the acceptable range, offer it up.
          if(calculateDistance(pos, geolocation.pos) < options.flexRadius) {
            foundCloserCity = true;
            showMessage(messages.betterChoice, '<a href="/' + city.id + '">' + city.title + '</a>');
            return false;
          }

        });

        // Otherwise, show comically far distance to nearest station.
        if(!foundCloserCity) {
          showMessage(messages.tooDistant, Math.round(station.rank));
        }

        // Break each loop.
        return false;

      }

      // Show the closest five stations and any others within a useful radius.
      if(i < 5 || station.rank < options.usefulRadius) {
        app.nearby.currentView.addStation($.extend({}, station, {
          distance: formatDistance(station.rank, true)
        }));
      }

    });

  },

  // Show warning or error message.
  showMessage = function(message, replacement) {
    if(replacement) {
      message = message.replace('%str%', replacement);
    }
    config.els.geolocation.message.html(message);
  },

  // Attempt geolocation.
  geolocate = function() {

    if(navigator.geolocation && !isLocating) {

      if(app.localstorage.get('disable-geolocation') === 'true') {

        // Show geolocation button.
        config.els.geolocation.button.show();

      } else {

        // Turn on internal indicator.
        isLocating = true;

        // Remove existing stations.
        app.nearby.currentView.collection.reset();

        // Adjust UI.
        showMessage(messages.standard);
        config.els.geolocation.button.hide();
        config.els.geolocation.container.addClass('loading');
        config.els.geolocation.container.slideDown();

        // Get current position.
        getPosition(parsePosition, positionError);

      }

    }

  },

  retryGeolocation = function() {
    app.localstorage.set('disable-geolocation', 'false');
    geolocate();
  },

  // Disable geolacation by user request.
  disableGeolocation = function() {

    // Hide nearby stations, show button, and store decision.
    config.els.geolocation.container.slideUp();
    config.els.geolocation.button.show();
    app.localstorage.set('disable-geolocation', 'true');

  },

  // Hide geolacation for errors and snapshots.
  hideGeolocation = function() {
    config.els.geolocation.container.slideUp();
  },

  // Convert from E6 geodata to decimal.
  convertE6 = function(int) {
    return int / 1000000;
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

  // Convert meters to feet.
  mToFt = function(m) {
    return Math.round(m * 3.28084);
  },

  // Format the distance in conversational terms.
  formatDistance = function(distance, expandRadius) {
    if(distance <= 0.12) {
      // Round short distances to the nearest ten feet.
      return (Math.round(distance * 5280 / 10) * 10) + ' ft';
    } else {
      if(distance < 1 || (expandRadius && distance <= options.flexRadius)) {
        // Round farther distances to the nearest tenth of a mile.
        return (Math.round(distance * 10) / 10) + ' mi';
      }
      return '';
    }
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
  app.vent.bind('geolocation:hide', hideGeolocation);

});
