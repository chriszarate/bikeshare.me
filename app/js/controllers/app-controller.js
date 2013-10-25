/* App controller */

var AppController = Marionette.Controller.extend({

  home: function(city) {

    // Create new stations collection.
    var stations = new Stations();

    // Get city.
    this.getCity(city);

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

    // Remove snapshot class from body.
    $('body').removeClass('snapshot');

    // Send triggers to app modules.
    app.vent.trigger('suggestions:initialize:cities', config.api);
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

      // Add snapshot class to body.
      $('body').addClass('snapshot');

      // Send triggers to app modules.
      app.vent.trigger('api:update:fetch');

    } else {
      this.error('Could not load snapshot.');
    }

  },

  getCity: function(city) {

    // If no city was supplied, find one in local storage.
    if(!city) {
      if(window.localStorage) {
        city = localStorage.getItem('city') || 'nyc';
      } else {
        this.error('Your browser does not support local storage.');
      }
    }

    // Set city.
    this.setCity(city);

  },

  setCity: function(city) {

    // Strip extraneous characters.
    city = city.replace(/[ \/]+/, '');

    // Make sure requested city is supported.
    if(config.api[city]) {

      // Announce city selection.
      config.city = city;
      localStorage.setItem('city', city);
      app.vent.trigger('messages:city:change', city);

      // Delete existing station data.
      delete config.stations;

    } else {
      this.setCity('nyc');
      this.error('Unsupported city.');
    }

  },

  error: function(message) {
    Backbone.history.navigate('', true);
    app.vent.trigger('messages:error', message);
  }

});
