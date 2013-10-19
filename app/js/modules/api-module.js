/* API module */

app.module('api', function(api, app, Backbone, Marionette, $) {

  // Placeholder for API response promise.
  var updatePromise = false,

  // API endpoint.
  apiEndpoints = config.api[config.city],

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
        app.vent.trigger('messages:api:error', 'Could not connect to the server.');
      });
    }

    // Parse response.
    updatePromise.then(parseData);

  },

  // Parse availablility data.
  parseData = function(data) {

    if(data.ok) {

      // Debug.
      if(config.api.debug) {
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
      app.vent.trigger('messages:api:updated', new Date());

    } else {

      // Data was not usable.
      app.vent.trigger('messages:api:error', 'Cannot read availability data.');

    }

  },

  // Update station availability.
  updateAvailability = function() {

    // Request update.
    fetchUpdate();

    // Send event triggers.
    app.vent.trigger('messages:reset');
    populateAvailability();

  },

  // Send availability data to stations view.
  populateAvailability = function() {
    if(updatePromise) {
      updatePromise.then(function() {
        app.main.currentView.populateAvailability(cache.stations);
        if(app.nearby.currentView) {
          app.nearby.currentView.populateAvailability(cache.stations);
        }
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
  app.vent.bind('api:update:fetch', fetchUpdate);
  app.vent.bind('api:update:populate', populateAvailability);

});
