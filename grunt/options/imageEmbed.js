/* grunt-image-embed */

module.exports = {
  dist: {
    src: [
      'app/css/main.css',
      'app/css/faq.css'
    ],
    dest: 'app/build/app.css',
    options: {
      baseDir: './app'
    }
  }
};
