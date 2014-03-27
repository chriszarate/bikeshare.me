/* Grunt task aliases */

module.exports = function(grunt) {

  grunt.registerTask(
    'default',
    [
      'concat:app',
      'jshint',
      'jst',
      'uglify:app',
      'string-replace:fix',
      'imageEmbed',
      'cssmin',
      'manifest'
    ]
  );

  grunt.registerTask('setup', ['components']);
  grunt.registerTask('components', ['uglify:components', 'concat:components']);
  grunt.registerTask('dev', ['default', 'connect', 'watch']);

};
