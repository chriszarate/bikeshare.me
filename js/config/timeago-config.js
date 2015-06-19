/* jQuery Timeago configuration */

$.timeago.settings.refreshMillis = 5000;
$.timeago.settings.strings = $.extend($.timeago.settings.strings, {
  suffixAgo: '',
  seconds: 'Updated',
  minute: '1m',
  minutes: '%dm',
  hour: '1h',
  hours: '%dh',
  day: '1d',
  days: '%dd',
  month: '1mo',
  months: '%dmo'
});
