/* LocalStorage module */

app.module('localstorage', function(localstorage) {

  // Set local storage.
  localstorage.set = function(key, value) {
    if(window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  };

  // Get local storage.
  localstorage.get = function(key) {
    return (window.localStorage) ? window.localStorage.getItem(key) : null;
  };

});
