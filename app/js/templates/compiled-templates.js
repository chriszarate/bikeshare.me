this["JST"] = this["JST"] || {};

this["JST"]["app/js/templates/station-static.tmpl"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<p class="station ' +
((__t = ( color )) == null ? '' : __t) +
' ' +
((__t = ( flags.station )) == null ? '' : __t) +
'">\n  <span class="title">' +
((__t = ( title )) == null ? '' : __t) +
'</span>\n  <span class="status">' +
((__t = ( status )) == null ? '' : __t) +
'</span>\n  <span class="docks ' +
((__t = ( flags.docks || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( available.docks )) == null ? '' : __t) +
'<span class="short">d</span> <span class="long">docks</span></span>\n  <span class="bikes ' +
((__t = ( flags.bikes || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( available.bikes )) == null ? '' : __t) +
'<span class="short">b</span> <span class="long">bikes</span></span>\n</p>\n';

}
return __p
};

this["JST"]["app/js/templates/station.tmpl"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<p class="station ' +
((__t = ( color )) == null ? '' : __t) +
' ' +
((__t = ( flags.station )) == null ? '' : __t) +
'">\n  <span class="title">' +
((__t = ( title )) == null ? '' : __t) +
'</span>\n  <span class="status">' +
((__t = ( status )) == null ? '' : __t) +
'</span>\n  <span class="destroy">×</span>\n  <span class="docks ' +
((__t = ( flags.docks || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( available.docks )) == null ? '' : __t) +
'<span class="short">d</span> <span class="long">docks</span></span>\n  <span class="bikes ' +
((__t = ( flags.bikes || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( available.bikes )) == null ? '' : __t) +
'<span class="short">b</span> <span class="long">bikes</span></span>\n</p>\n';

}
return __p
};