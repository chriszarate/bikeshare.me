/* Stations view */

var StationsView = Backbone.Marionette.CollectionView.extend({

  itemView: StationView,
  tagName: 'ul',

  events: {
    'sortstart':  'startDrag',
    'sortstop':   'stopDrag',
    'sortupdate': 'changeOrder'
  },

  initialize: function() {

    // Listen to events.
    this.listenTo(this.collection, 'reset', this.updateAvailability);
    this.listenTo(this.collection, 'add remove change reset', this.createSnapshot);

    // Activate dragging and dropping.
    this.startDragDrop();

  },

  addStation: function(datum) {

    // Add station to collection.
    var model = this.collection.create({
      id: datum.id,
      title: datum.title
    });

    // Set availability data, if present.
    if(datum.availability) {
      model.updateAvailability(datum.availability);
    }

    // Set distance data, if present.
    if(datum.distance) {
      model.updateDistance(datum.distance);
    }

    // Update drag and drop.
    this.updateDragDrop();

  },

  updateAvailability: function() {
    app.vent.trigger('api:update:soft');
  },

  populateAvailability: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id].availability) {
        model.updateAvailability(stationData[model.id].availability);
      }
    });
  },

  populateDistance: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id].distance) {
        model.updateDistance(stationData[model.id].distance);
      }
    });
  },

  createSnapshot: function() {
    if(!this.isSorting) {
      var base62link = this.collection.map(app.snapshot.encode);
      app.vent.trigger('messages:share', base62link.join('-'));
    }
  },

  startDragDrop: function() {

    // Make list sortable.
    this.$el.sortable(config.jqueryui.sortable);

    // Make target droppable.
    config.jqueryui.dropTarget
      .droppable(config.jqueryui.droppable)
      .on('drop', this.processDrop);

  },

  updateDragDrop: function() {
    this.$el.sortable('refresh');
  },

  startDrag: function() {
    config.jqueryui.dropTarget.show();
  },

  stopDrag: function() {
    config.jqueryui.dropTarget.hide();
  },

  processDrop: function(event, ui) {
    ui.draggable.trigger('drop:item');
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

    // Unannounce sorting.
    this.isSorting = false;

    // Resort and create snapshot.
    this.collection.sort();
    this.createSnapshot();

  }

});
