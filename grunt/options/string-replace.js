/* grunt-string-replace */

// Fix Uglify's inability to cope with a subdirectory webroot.
module.exports = {
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
};
