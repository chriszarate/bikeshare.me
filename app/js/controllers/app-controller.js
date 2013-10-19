/* App controller */

var AppController = Marionette.Controller.extend({

  home: function() {

    // Set city code.
    if(!config.city) {
    config.city = 'nyc',
    }

    // Create new stations collection.
    stations = new Stations();

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

    app.vent.trigger('suggestions:initialize', cache.stations);
    app.vent.trigger('geolocation:initialize');

  },

  share: function(city, str) {

    // Decode request.
    var snapshot = app.snapshot.decode(str);

    // Set city code.
    config.city = city,

    // Proceed if valid.
    if(snapshot.length) {

      // Create new stations collection.
      var stations = new Stations();

      $.each(snapshot, function(i, datum) {
        if(cache.stations[datum.id]) {
          datum.title = cache.stations[datum.id].title;
        }
      });

      // Append new read-only view.
      app.main.show(
        new StationsView({
          collection: stations
        })
      );

      stations.reset(snapshot);

      // Show/hide UI elements.
      config.els.geolocation.container.hide();
      config.els.snapshot.button.hide();
      config.els.suggestions.main.hide();
      config.els.suggestions.button.hide();

    } else {
      this.error();
    }

  },

  error: function() {
    Backbone.history.navigate('', true);
  }

});
