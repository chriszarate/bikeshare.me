/* API configuration */

// API endpoints.
config.api = {
  debug: false,
  nyc: {
    apiBaseURL: 'http://appservices.citibikenyc.com',
    apiUpdatePath: '/data2/stations.php?updateOnly=true'
  }
};
