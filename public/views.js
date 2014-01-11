var doT = (function(){
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['directory-list-item']=function anonymous(it) {
var out=''; var arg = arguments[1],tempThumbFolder = "_historyThumb";if(it.content.type === "folder" && it.name !== tempThumbFolder){out+='<div>'+(it.name)+(it.ext)+' <a href="'+(it.path.nav)+(encodeURIComponent(it.name))+(it.ext)+'&amp;preview=false">Directory list</a> <a href="'+(it.path.nav)+(encodeURIComponent(it.name))+(it.ext)+'&amp;preview=true">Thumbnail preview</a></div>';}else if(it.content.type === "image" && arg.qs.preview === "true"){out+='<div>'+(it.name)+(it.ext)+' <img src="/img/spinner.gif" data-src="'+(tempThumbFolder)+'/'+(it.name)+(it.ext)+'" class="directory-thumb-wait"></div>';}else if(it.content.type === "image" && arg.qs.preview === "false"){out+='<div>'+(it.name)+(it.ext)+' <img src="'+(it.path.rel)+(it.name)+(it.ext)+'" class="directory-thumb"></div>';}else{out+='<div>'+(it.name)+(it.ext)+'</div>';}return out;
};
return tmpl;})();