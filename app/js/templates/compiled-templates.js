this["JST"] = this["JST"] || {};

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
'</span>\n  <span class="docks ' +
((__t = ( flags.docks || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( (available.docks < 10) ? '0' : '' )) == null ? '' : __t) +
'' +
((__t = ( available.docks )) == null ? '' : __t) +
' ○</span>\n  <span class="bikes ' +
((__t = ( flags.bikes || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( (available.bikes < 10) ? '0' : '' )) == null ? '' : __t) +
'' +
((__t = ( available.bikes )) == null ? '' : __t) +
' ●</span>\n</p>\n';

}
return __p
};