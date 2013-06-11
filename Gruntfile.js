module.exports = function(grunt) {

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
            'app/components/jquery/jquery.min.js',
            'app/components/lodash/dist/lodash.underscore.min.js',
            'app/components/backbone/backbone-min.js',
            'app/components/backbone.localStorage/backbone.localStorage-min.js',
            'app/components/backbone.marionette/lib/backbone.marionette.min.js',
            'app/components/typeahead.js/dist/typeahead.min.js',
            'app/components/jquery-timeago/jquery.timeago.min.js',
            'app/components/jquery-ui/ui/minified/jquery.ui.core.min.js',
            'app/components/jquery-ui/ui/minified/jquery.ui.widget.min.js',
            'app/components/jquery-ui/ui/minified/jquery.ui.mouse.min.js',
            'app/components/jquery-ui/ui/minified/jquery.ui.sortable.min.js',
            'app/components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
            'app/components/base62/base62.min.js'
          ]
        }
      }
    },

    uglify: {
      app: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n'
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
          'app/components/jquery-timeago/jquery.timeago.min.js': [
            'app/components/jquery-timeago/jquery.timeago.js'
          ]
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
          network: ['*'],
          fallback: ['/ /index.html'],
          verbose: true,
          timestamp: true
        },
        src: [
          'build/app.min.js',
          'build/components.min.js',
          'css/main.min.css',
          'data/stations.js'
        ],
        dest: 'app/manifest.appcache'
      }
    }
  });

  // Load tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-manifest');

  grunt.registerTask('default', ['concat:app', 'jshint', 'uglify:app', 'cssmin', 'manifest']);
  grunt.registerTask('templates', ['jst']);
  grunt.registerTask('components', ['uglify:components', 'concat:components']);

};
