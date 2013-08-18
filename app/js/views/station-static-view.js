/* Station static view */

var StationStaticView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  template: JST['app/js/templates/station.tmpl'],

  serializeData: function() {
    return $.extend(
      this.model.toJSON(),
      this.model.availability,
      this.model.getAlternate(),
      this.model.getDistance(),
      this.model.getColor(),
      {id: ''}
    );
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  }

});
