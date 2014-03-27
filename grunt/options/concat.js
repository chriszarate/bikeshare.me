/* grunt-contrib-concat */

module.exports = {
  app: {
    options: {
      banner:
        '/*!\n' +
        ' * <%= pkg.name %> v<%= pkg.version %>\n' +
        ' * <%= pkg.author.name %>\n' +
        ' * <%= pkg.repository.url %>\n' +
        ' * License: <%= pkg.license %>\n' +
        ' */\n\n'
    },
    files: {
      'app/build/app.js': [
        'app/js/init/*.js',
        'app/js/config/*.js',
        'app/js/models/*.js',
        'app/js/views/*.js',
        'app/js/controllers/*.js',
        'app/js/routers/*.js',
        'app/js/application/*.js',
        'app/js/modules/*.js',
        'app/js/main.js'
      ]
    }
  },
  components: {
    files: {
      'app/build/components.min.js': [
        'app/bower_components/jquery/jquery.min.js',
        'app/bower_components/lodash/dist/lodash.underscore.min.js',
        'app/bower_components/backbone/backbone-min.js',
        'app/bower_components/backbone.localStorage/backbone.localStorage-min.js',
        'app/bower_components/backbone.marionette/lib/backbone.marionette.min.js',
        'app/bower_components/typeahead.js/dist/typeahead.min.js',
        'app/bower_components/jquery-timeago/jquery.timeago.min.js',
        'app/bower_components/jquery-ui/ui/minified/jquery.ui.core.min.js',
        'app/bower_components/jquery-ui/ui/minified/jquery.ui.widget.min.js',
        'app/bower_components/jquery-ui/ui/minified/jquery.ui.mouse.min.js',
        'app/bower_components/jquery-ui/ui/minified/jquery.ui.sortable.min.js',
        'app/bower_components/jquery-ui/ui/minified/jquery.ui.droppable.min.js',
        'app/bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
        'app/bower_components/base62/base62.min.js'
      ]
    }
  }
};
