/* grunt-contrib-cssmin */

module.exports = {
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
};
