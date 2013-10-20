/* App controller */

var AppController = Marionette.Controller.extend({

  home: function() {

    // Create new stations collection.
    var stations = new Stations();

    // Set city.
    this.setCity('nyc');

    // Set local storage for the collection.
    stations.localStorage = new Backbone.LocalStorage(config.city + '-stations');

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
    app.vent.trigger('api:update:fetch', true);

  },

  share: function(city, str) {

    // Decode request.
    var snapshot = app.snapshot.decode(str);

    // Set city.
    this.setCity(city);

    // Proceed if valid.
    if(snapshot.length) {

      // Create new stations collection.
      var stations = new Stations();

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
      app.vent.trigger('messages:error', 'Could not load snapshot.');
    }

  },

  setCity: function(city) {

    // Make sure requested city is supported.
    if(config.api[city]) {
      config.city = city;
    } else {
      app.vent.trigger('messages:error', 'Unsupported city.');
    }

  },

  error: function() {
    Backbone.history.navigate('', true);
    app.vent.trigger('messages:error', 'Could not process your request.');
  }

});
