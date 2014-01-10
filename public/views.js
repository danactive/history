var doT = (function(){
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['directory-list-item']=function anonymous(it) {
var out=''; var qs = util.queryObj(); if(it.content.type === "folder"){out+='<div>'+(it.name)+(it.ext)+' <a href="'+(it.path.nav)+(it.name)+(it.ext)+'&amp;preview=false">Directory list</a> <a href="'+(it.path.nav)+(it.name)+(it.ext)+'&amp;preview=true">Thumbnail preview</a></div>';}else if(it.content.type === "image" && qs.preview === "true"){out+='<div>'+(it.name)+(it.ext)+' <img src="/img/spinner.gif" data-src="_historyThumb/'+(it.name)+(it.ext)+'" class="directory-thumb-wait"></div>';}else if(it.content.type === "image" && qs.preview === "false"){out+='<div>'+(it.name)+(it.ext)+' <img src="'+(it.path.rel)+(it.name)+(it.ext)+'" class="directory-thumb"></div>';}else{out+='<div>'+(it.name)+(it.ext)+'</div>';}return out;
};
return tmpl;})();