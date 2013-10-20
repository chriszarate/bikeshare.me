/* Station model */

var Station = Backbone.Model.extend({

  // Set defaults.
  defaults: function() {
    return {
      title: 'Loading',
      color: 0,
      order: this.collection.nextOrder()
    };
  },

  // Unsynced attributes.
  availability: {
    status: '',
    available: {},
    flags: {}
  },

  alt: '',
  distance: '',

  _updating: false,

  // Change availability of station.
  updateAvailability: function(data) {
    this._updating = true;
    this.availability = data;
    this.trigger('change');
  },

  // Change availability of station.
  updateDistance: function(data) {
    this._updating = true;
    this.distance = data;
    this.trigger('change');
  },

  // Change the color of station.
  nextColor: function() {
    var i = this.get('color') + 1;
    this.save({
      color: (i < config.colorFlags.length) ? i : 0
    });
  },

  // Get the title of the station.
  getTitle: function() {
    // Use updated station data, if available.
    // Fallback to a shrug.
    return {
      title: (config.stations && config.stations[this.id]) ? config.stations[this.id].title : this.get('title')
    };
  },

  // Get the class name of the color.
  getColor: function() {
    return {
      color: config.colorFlags[this.get('color')]
    };
  },

  // Get the alternate name of the station.
  getAlternate: function() {
    return {
      alt: this.alt
    };
  },

  // Get the distance of the station.
  getDistance: function() {
    return {
      distance: this.distance
    };
  }

});


/* Stations collection */

var Stations = Backbone.Collection.extend({

  model: Station,
  comparator: 'order',

  nextOrder: function() {
    return (!this.length) ? 1 : this.last().get('order') + 1;
  }

});
