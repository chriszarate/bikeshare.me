module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      app: {
        options: {
          globals: {
            '$': true,
            '_': true,
            'Backbone': true,
            'Marionette': true,
            'Base62': true,
            'JST': true,
            'config': true,
            'cache': true,
            'console': true
          },
          browser: true,
          curly: true,
          eqeqeq: true,
          forin: true,
          indent: 2,
          noarg: true,
          strict: false,
          trailing: true,
          undef: true,
          unused: true
        },
        files: {
          src: ['app/build/app.js']
        }
      }
    },

    jst: {
      templates: {
        files: {
          'app/js/templates/compiled-templates.js': [
            'app/js/templates/*.tmpl'
          ]
        }
      }
    },

    concat: {
      app: {
        files: {
          'app/build/app.js': [
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
    },

    uglify: {
      app: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n',
          sourceMap: 'app/build/app.js.map',
          sourceMapRoot: '/',
          sourceMapPrefix: 1,
          sourceMappingURL: '/build/app.js.map'
        },
        files: {
          'app/build/app.min.js': [
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
    },

    "string-replace": {
      fix: {
        files: {
          'app/build/app.js.map': 'app/build/app.js.map'
        },
        options: {
          replacements: [{
            pattern: '"file":"app/build/app.min.js"',
            replacement: '"file":"build/app.min.js"'
          }]
        }
      }
    },

    cssmin: {
      add_banner: {
        files: {
          'app/css/main.min.css': [
            'app/css/main.css'
          ],
          'app/css/faq.min.css': [
            'app/css/faq.css'
          ]
        }
      }
    },

    manifest: {
      generate: {
        options: {
          basePath: 'app/',
          cache: [
            'http://themes.googleusercontent.com/static/fonts/lato/v6/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff',
            'http://themes.googleusercontent.com/static/fonts/lato/v6/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff'
          ],
          network: ['*'],
          fallback: ['/ /index.html'],
          verbose: true,
          timestamp: true
        },
        src: [
          'build/components.min.js',
          'build/stations.js',
          'build/app.min.js',
          'css/main.min.css'
        ],
        dest: 'app/cache.manifest'
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: 'app'
        }
      }
    },

    watch: {
      html: {
        options: {
          livereload: true
        },
        tasks: ['manifest'],
        files: ['app/index.html']
      },
      templates: {
        options: {
          livereload: true
        },
        tasks: [
          'templates'
        ],
        files: [
          'app/js/templates/*.js'
        ]
      },
      javascript: {
        options: {
          livereload: true
        },
        tasks: [
          'concat:app',
          'jshint',
          'uglify:app',
          'string-replace:fix',
          'manifest'
        ],
        files: [
          'app/js/**/*.js'
        ]
      },
      css: {
        options: {
          livereload: true
        },
        tasks: [
          'cssmin',
          'manifest'
        ],
        files: [
          'app/css/main.css',
          'app/css/faq.css'
        ]
      }
    }

  });

  // Register tasks.
  grunt.registerTask('default', ['concat:app', 'jshint', 'uglify:app', 'string-replace:fix', 'cssmin', 'manifest']);
  grunt.registerTask('setup', ['templates', 'components', 'stations']);
  grunt.registerTask('templates', ['jst']);
  grunt.registerTask('components', ['uglify:components', 'concat:components']);
  grunt.registerTask('dev', ['default', 'connect', 'watch']);

  grunt.registerTask('stations', function () {
    grunt.util.spawn({
      cmd: process.argv[0],
      args: ['server/update.js']
    });
    console.log('File "app/build/stations.js" created.');
  });

};
