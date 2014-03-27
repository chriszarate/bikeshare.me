/* grunt-contrib-cssmin */

module.exports = {
  add_banner: {
    files: {
      'app/build/app.min.css': [
        'app/build/app.css'
      ]
    }
  }
};
