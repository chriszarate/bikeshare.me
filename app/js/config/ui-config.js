/* UI configuration */

// Threshholds
config.threshholds = {
  danger: 5,
  caution: 10
};

// Station CSS classes
config.colorFlags = [
  'color1',
  'color2',
  'color3',
  'color4',
  'color5',
  'color6'
];

config.els = {
  app: {
    main: $('#main')
  },
  api: {
    button: $('#refresh')
  },
  geolocation: {
    main: $('#nearby-stations'),
    container: $('#nearby'),
    button: $('#geolocate'),
    close: $('#nearby .close-button')
  },
  messages: {
    error: $('#error'),
    warning: $('#warning')
  },
  snapshot: {
    button: $('#snapshot'),
    link: $('#snapshot a')
  },
  suggestions: {
    main: $('#suggestions'),
    input: $('#user-input'),
    button: $('#add')
  }
};
