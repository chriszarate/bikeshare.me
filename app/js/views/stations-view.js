/* Stations view */

var StationsView = Backbone.Marionette.CollectionView.extend({

  itemView: StationView,

  tagName: 'ul',

  events: {
    'sortstart':  'startDrag',
    'sortstop':   'stopDrag',
    'sortupdate': 'changeOrder'
  },

  initialize: function(options) {

    // Save options.
    this.options = options;

    // Listen to events.
    this.listenTo(this.collection, 'reset', this.updateAvailability);
    this.listenTo(this.collection, 'add', this.updateStation);
    this.listenTo(this.collection, 'add remove change sort reset', this.createSnapshot);

    // Activate dragging and dropping.
    if(this.options.editable) {
      this.startDragDrop();
      this.itemViewOptions = {
        editable: true
      };
    }

  },

  addStation: function(datum) {

    // Add station to collection.
    this.collection.add({
      id: datum.id,
      title: datum.title
    }, datum);

    // Update drag and drop.
    if(this.options.editable) {
      this.updateDragDrop();
    }

  },

  updateStation: function(model, collection, attributes) {

    // Save model as needed.
    if(this.options.editable) {
      model.save();
    }

    // Set availability data, if present.
    if(attributes && attributes.availability) {
      model.updateAvailability(attributes.availability);
    }

    // Set distance data, if present.
    if(attributes && attributes.distance) {
      model.updateDistance(attributes.distance);
    }

  },

  updateAvailability: function() {
    if(config.stations) {
      this.populateAvailability(config.stations);
    }
  },

  populateAvailability: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id]) {
        if(stationData[model.id].availability) {
          model.updateAvailability(stationData[model.id].availability);
        }
      } else {
        // Station does not exist, make it appear inactive.
        model.updateAvailability({
          available: {},
          flags: {station: 'inactive'}
        });
      }
    });
  },

  populateDistance: function(stationData) {
    this.collection.each(function(model) {
      if(stationData[model.id] && stationData[model.id].distance) {
        model.updateDistance(stationData[model.id].distance);
      }
    });
  },

  createSnapshot: function() {
    if(this.options.editable && !this.isSorting) {
      var base62link = this.collection.map(app.snapshot.encode);
      app.vent.trigger('messages:snapshot:link', base62link.join('-'));
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
    app.vent.trigger('suggestions:close');
    config.jqueryui.dropTarget.show();
    config.els.suggestions.stations.button.hide();
  },

  stopDrag: function() {
    config.jqueryui.dropTarget.hide();
    config.els.suggestions.stations.button.show();
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

  }

});
