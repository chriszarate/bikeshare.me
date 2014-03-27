/* grunt-contrib-jshint */

module.exports = {
  options: {
    camelcase: true,
    curly: true,
    devel: true,
    eqeqeq: true,
    forin: true,
    immed: true,
    indent: 2,
    latedef: true,
    newcap: true,
    noarg: true,
    noempty: true,
    plusplus: true,
    quotmark: true,
    strict: false,
    trailing: true,
    undef: true,
    unused: true
  },
  app: {
    options: {
      browser: true,
      globals: {
        '_': true,
        'Backbone': true,
        'Marionette': true,
        'Base62': true,
        'JST': true
      },
      jquery: true
    },
    files: {
      src: ['app/build/app.js']
    }
  }
};
