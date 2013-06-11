/* API module */

app.module('api', function(api, app, Backbone, Marionette, $) {

  // Placeholder for last-updated date.
  var lastUpdated = false,

  // API response deferred object.
  updatePromise = new $.Deferred(),

  apiEndpoints = config.api[cache.city],

  // Request availablility data.
  fetchUpdate = function(bootstrap) {

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

      // Reset messages.
      app.vent.trigger('messages:reset');

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
      lastUpdated = new Date();
      app.vent.trigger('messages:updated', 'now');

    } else {

      // Data was not usable.
      app.vent.trigger('messages:error', 'Cannot read availability data.');

    }

  },

  // Update station availability.
  updateAvailability = function() {

    // Request update.
    fetchUpdate(false);

    // Send event triggers.
    app.vent.trigger('messages:reset');
    populateAvailability();

  },

  // Send availability data to stations view.
  populateAvailability = function() {
    updatePromise.then(function() {
      app.main.currentView.populateAvailability(cache.stations);
    });
  },

  // Change the last-updated date.
  changeUpdateDate = function() {
    if(lastUpdated) {
      app.vent.trigger('messages:updated', lastUpdated);
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

  // Bind to events.
  app.vent.bind('api:update:bootstrap', fetchUpdate);
  app.vent.bind('api:update:hard', updateAvailability);
  app.vent.bind('api:update:soft', populateAvailability);

  // Refresh last-updated date every minute.
  setInterval(changeUpdateDate, 60000);

});
