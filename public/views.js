var doT = (function(){
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['directory-list-item']=function anonymous(it) {
var out=''; var arg = arguments[1],tempThumbFolder = "_historyThumb";if(it.content.type === "folder" && it.name !== tempThumbFolder){out+='<li><span>'+(it.name)+(it.ext)+'</span><!--a href="'+(it.path.nav)+(encodeURIComponent(it.name))+(it.ext)+'&amp;preview=false">Directory list</a--> <a href="'+(it.path.nav)+(encodeURIComponent(it.name))+(it.ext)+'&amp;preview=true">Thumbnail preview</a></li>';}else if(it.content.type === "image" && arg.qs.preview === "true"){out+='<li data-file="'+(it.name)+'" data-ext="'+(it.ext)+'" data-type="'+(it.content.type)+'"><span>'+(it.name)+(it.ext)+'</span><img src="/img/spinner.gif" class="directory-thumb-wait"></li>';}else if(it.content.type === "image" && arg.qs.preview === "false"){out+='<li><span>'+(it.name)+(it.ext)+'</span><img src="'+(it.path.rel)+(it.name)+(it.ext)+'" class="directory-thumb"></li>';}else{out+='<li><span>'+(it.name)+(it.ext)+'</span></li>';}return out;
};
return tmpl;})();