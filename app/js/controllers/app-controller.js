/* App controller */

var AppController = Marionette.Controller.extend({

  home: function() {

    // Load station data.
    this.loadStations('nyc', this.showHome);

  },

  share: function(city, str) {

    // Store snapshot.
    config.snapshot = str;

    // Load station data.
    this.loadStations(city, this.showSnapshot);

  },

  error: function() {
    Backbone.history.navigate('', true);
    app.vent.trigger('messages:error', 'Could not process your request.');
  },

  loadStations: function(city, callback) {

    // Cache stations list.
    var cacheStations = function(data) {
      config.stations.list = config.stations[city].list = data;
    };

    // Check for valid city.
    if(config.stations[city]) {

      // Store city.
      config.city = city;

      // Get stations list or use already loaded one.s
      if(!config.stations[city].list) {
        $.getJSON(config.stations[city].url)
          .fail(this.error)
          .done(cacheStations)
          .done(callback);
      } else {
        callback();
      }

    } else {
      this.error();
    }

  },

  showHome: function() {

    // Create new stations collection.
    var stations = new Stations();

    // Append view for saved stations.
    app.main.show(
      new StationsView({
        collection: stations,
        editable: true
      })
    );

    // Append view for nearby stations.
    app.nearby.show(
      new StationsView({
        collection: new Stations()
      })
    );

    // Fetch stations from local storage.
    stations.fetch({reset: true});

    // Show/hide UI elements.
    config.els.suggestions.button.show();

    // Send triggers to app modules.
    app.vent.trigger('api:update:fetch');
    app.vent.trigger('suggestions:initialize', config.stations.list);
    app.vent.trigger('geolocation:initialize');

  },

  showSnapshot: function() {

    // Decode request.
    var snapshot = app.snapshot.decode(config.snapshot);

    // Proceed if valid.
    if(snapshot.length) {

      // Create new stations collection.
      var stations = new Stations();

      // Get station titles from station list.
      $.each(snapshot, function(i, datum) {
        if(config.stations.list[datum.id]) {
          datum.title = config.stations.list[datum.id].title;
        }
      });

      // Append new read-only view.
      app.main.show(
        new StationsView({
          collection: stations
        })
      );

      // Add snapshot stations to read-only view.
      stations.reset(snapshot);

      // Show/hide UI elements.
      config.els.geolocation.container.hide();
      config.els.snapshot.button.hide();
      config.els.suggestions.main.hide();
      config.els.suggestions.button.hide();

      // Send triggers to app modules.
      app.vent.trigger('api:update:fetch');

    } else {
      this.error();
    }

  }

});
