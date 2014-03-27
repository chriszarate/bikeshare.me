/* grunt-contrib-watch */

module.exports = {
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
      'app/js/templates/*.tmpl'
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
};
