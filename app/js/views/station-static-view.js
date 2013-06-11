/* Station static view */

var StationStaticView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  template: JST['app/js/templates/station-static.tmpl'],

  serializeData: function() {
    return $.extend(
      this.model.toJSON(),
      this.model.availability,
      this.model.getColor()
    );
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  }

});
