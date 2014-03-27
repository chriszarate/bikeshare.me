/* grunt-manifest */

module.exports = {
  generate: {
    options: {
      basePath: 'app',
      cache: [
        'http://themes.googleusercontent.com/static/fonts/lato/v6/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff',
        'http://themes.googleusercontent.com/static/fonts/lato/v6/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff'
      ],
      process: function(path) { return '/' + path; },
      network: ['*'],
      fallback: ['/ /'],
      verbose: true,
      timestamp: true
    },
    src: [
      'build/components.min.js',
      'build/app.min.js',
      'build/app.min.css'
    ],
    dest: 'app/cache.manifest'
  }
};
