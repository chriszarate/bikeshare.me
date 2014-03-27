/* grunt-contrib-uglify */

module.exports = {
  app: {
    options: {
      // Cannot use banner with source map (grunt-contrib-uglify #22).
      // banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n',
      preserveComments: 'some',
      sourceMap: 'app/build/app.js.map',
      sourceMapRoot: '/',
      sourceMapPrefix: 1,
      sourceMappingURL: '/build/app.js.map'
    },
    files: {
      'app/build/app.min.js': [
        'app/js/banner.txt',
        'app/js/init/*.js',
        'app/js/config/*.js',
        'app/js/templates/*.js',
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
      'app/bower_components/jquery-timeago/jquery.timeago.min.js': [
        'app/bower_components/jquery-timeago/jquery.timeago.js'
      ]
    }
  }
};
