this["JST"] = this["JST"] || {};

this["JST"]["js/templates/station.tmpl"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<p class="station ' +
((__t = ( color )) == null ? '' : __t) +
' ' +
((__t = ( flags.station )) == null ? '' : __t) +
'" data-oid="' +
((__t = ( id )) == null ? '' : __t) +
'">\n  <span class="title">' +
((__t = ( title )) == null ? '' : __t) +
'</span>\n  <span class="availability">\n    <span class="bikes ' +
((__t = ( flags.bikes || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( (available.bikes < 10) ? '0' : '' )) == null ? '' : __t) +
'' +
((__t = ( available.bikes )) == null ? '' : __t) +
'●</span>\n    <span class="docks ' +
((__t = ( flags.docks || 'new' )) == null ? '' : __t) +
'">' +
((__t = ( (available.docks < 10) ? '0' : '' )) == null ? '' : __t) +
'' +
((__t = ( available.docks )) == null ? '' : __t) +
'○</span>\n  </span>\n  ';
 if(alt) { ;
__p += '\n    <span class="alt">' +
((__t = ( alt || '' )) == null ? '' : __t) +
'</span>\n  ';
 } ;
__p += '\n  ';
 if(distance) { ;
__p += '\n    <span class="distance">' +
((__t = ( distance || '' )) == null ? '' : __t) +
'</span>\n  ';
 } ;
__p += '\n</p>\n';

}
return __p
};