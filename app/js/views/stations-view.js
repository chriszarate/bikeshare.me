/* Stations view */

var StationsView = Backbone.Marionette.CollectionView.extend({

  itemView: StationView,
  tagName: 'ul',

  isSorting: false,

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.updateAvailability);
    this.listenTo(this.collection, 'add remove change reset', this.createSnapshot);
  },

  addStation: function(datum) {

    // Add station to collection.
    var model = this.collection.create({
      id: datum.id,
      title: datum.title
    });

    // Set availability data, if present.
    if(datum.availability) {
      model.update(datum.availability);
    }

    // Update list sortability.
    this.makeSortable();

  },

  updateAvailability: function() {
    app.vent.trigger('api:update:soft');
  },

  populateAvailability: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id].availability) {
        model.update(stationData[model.id].availability);
      }
    });
  },

  createSnapshot: function() {
    if(!this.isSorting) {
      var base62link = this.collection.map(app.snapshot.encode);
      app.vent.trigger('messages:share', base62link.join('-'));
    }
  },

  makeSortable: function() {
    this.$el.sortable('refresh');
  },

  changeOrder: function() {

    // Announce sorting.
    this.isSorting = true;

    // Update order of each model (via its view).
    _.each(this.children._views, function(view) {
      var newOrder = view.$el.index() + 1;
      if(newOrder !== view.model.get('order')) {
        view.model.save({order: newOrder});
      }
    });

    // Resort and create snapshot.
    this.collection.sort();
    this.isSorting = false;
    this.createSnapshot();

  }

});
