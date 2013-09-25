/* API module */

app.module('api', function(api, app, Backbone, Marionette, $) {

  // Placeholder for API response promise.
  var updatePromise = false,

  // API endpoint.
  apiEndpoints = config.api[cache.city],

  // Request availablility data.
  fetchUpdate = function(bootstrap) {

    // Create promise.
    updatePromise = new $.Deferred();

    // Use bootstrapped data or fetch API response.
    if(bootstrap && cache.update) {
      updatePromise.resolve(cache.update);
    } else {
      $('.bikes, .docks').hide();
      $.ajax({
        url: apiEndpoints.apiBaseURL + apiEndpoints.apiUpdatePath,
        dataType: 'jsonp',
        timeout: 5000
      }).done(function(data) {
        updatePromise.resolve(data);
      }).fail(function() {
        app.vent.trigger('messages:error', 'Could not connect to the server.');
      });
    }

    // Parse response.
    updatePromise.then(parseData);

  },

  // Parse availablility data.
  parseData = function(data) {

    if(data.ok) {

      // Debug.
      if(config.debug) {
        console.log(data);
      }

      // Pass along messages from the API.
      if(data.meta.length) {
        var warning = $.map(data.meta, function(str) { return str; });
        app.vent.trigger('messages:warn', warning.join('<br>'));
      }

      // Cache station IDs.
      $.each(data.results, function(i, station) {
        if(cache.stations[station.id]) {
          cache.stations[station.id].availability = {
            status: station.status,
            available: {
              bikes: station.availableBikes,
              docks: station.availableDocks
            },
            flags: {
              station: station.status.toLowerCase(),
              bikes: applyUIThreshholds(station.availableBikes),
              docks: applyUIThreshholds(station.availableDocks)
            }
          };
        }
      });

      // Change last updated date.
      app.vent.trigger('messages:updated', new Date());

    } else {

      // Data was not usable.
      app.vent.trigger('messages:error', 'Cannot read availability data.');

    }

  },

  // Update station availability.
  updateAvailability = function(e) {

    // Request update.
    fetchUpdate(false);

    // Send event triggers.
    app.vent.trigger('messages:reset');
    populateAvailability();

    // Stop propagation.
    e.preventDefault();
    e.stopPropagation();

  },

  // Send availability data to stations view.
  populateAvailability = function() {
    if(updatePromise) {
      updatePromise.then(function() {
        app.main.currentView.populateAvailability(cache.stations);
        app.nearby.currentView.populateAvailability(cache.stations);
      });
    }
  },

  // Apply warning threshholds to availability data.
  applyUIThreshholds = function(num) {
    if(num < config.threshholds.danger) {
      return 'danger';
    }
    if(num < config.threshholds.caution) {
      return 'caution';
    }
    return 'ok';
  };

  // Bind to "refresh" button.
  config.els.api.button.on('click', updateAvailability);

  // Bind to events.
  app.vent.bind('api:update:bootstrap', fetchUpdate);
  app.vent.bind('api:update:soft', populateAvailability);

});
