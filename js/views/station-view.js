/* Station view */

var StationView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  template: JST['js/templates/station.tmpl'],

  serializeData: function() {
    return $.extend(
      this.model.toJSON(),
      this.model.availability,
      this.model.getTitle(),
      this.model.getAlternate(),
      this.model.getDistance(),
      this.model.getColor()
    );
  },

  events: {
    'click': 'nextColor',
    'drop:item': 'clear'
  },

  initialize: function(options) {
    this.options = options;
    this.listenTo(this.model, 'change', this.render);
  },

  onBeforeRender: function() {
    if(!this.model._changing && !this.model._updating) {
      this.$el.hide();
    }
  },

  onRender: function() {
    if(!this.model._changing && !this.model._updating) {
      this.$el.slideDown('fast');
    }
    this.model._updating = false;
  },

  nextColor: function() {
    if(this.options.editable) {
      this.model.nextColor();
    }
  },

  clear: function(e) {
    e.stopPropagation();
    this.model.destroy();
  }

});
