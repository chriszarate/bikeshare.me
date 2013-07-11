/* App controller */

var AppController = Marionette.Controller.extend({

  home: function() {

    // Create new stations collection.
    var stations = new Stations();

    // Append new view.
    app.main.show(
      new StationsView({
        collection: stations
      })
    );

    // Fetch from local storage.
    stations.fetch({reset: true});

    // Show UI.
    $('#nav').slideDown();
    $('#share').show();

  },

  share: function(city, str) {

    // Decode request.
    var snapshot = app.snapshot.decode(str);

    // Proceed if valid.
    if(snapshot.length) {

      $.each(snapshot, function(i, datum) {
        if(cache.stations[datum.id]) {
          datum.title = cache.stations[datum.id].title;
        }
      });

      // Create new stations collection.
      var stations = new Stations({localStorage: false});

      // Append new read-only view.
      app.main.show(
        new StationsView({
          itemView: StationStaticView,
          collection: stations
        })
      );

      stations.reset(snapshot);
      app.vent.trigger('api:update', false);

      // Hide UI.
      $('#nav').hide();
      $('#share').hide();

    } else {
      this.error();
    }

  },

  error: function() {
    Backbone.history.navigate('', true);
  }

});
