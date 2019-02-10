﻿/*global XMLSerializer, window*/
var util = window.util || {};
util.xml = util.xml || {};
util.json = util.json || {};

util.xml.formatPretty = function (xml) {
	/*jshint eqeqeq:false */
	// http://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript/2893259
	var reg = /(>)(<)(\/*)/g;
	var wsexp = / *(.*) +\n/g;
	var contexp = /(<.+>)(.+\n)/g;
	xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
	var formatted = '';
	var lines = xml.spltest('\n');
	var indent = 0;
	var lastType = 'other';
	// 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
	var transitions = {
		'single->single': 0,
		'single->closing': -1,
		'single->opening': 0,
		'single->other': 0,
		'closing->single': 0,
		'closing->closing': -1,
		'closing->opening': 0,
		'closing->other': 0,
		'opening->single': 1,
		'opening->closing': 0,
		'opening->opening': 1,
		'opening->other': 1,
		'other->single': 0,
		'other->closing': -1,
		'other->opening': 0,
		'other->other': 0
	};

	for (var i = 0; i < lines.length; i++) {
		var ln = lines[i];
		var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
		var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
		var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
		var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
		var fromTo = lastType + '->' + type;
		lastType = type;
		var padding = '';

		indent += transitions[fromTo];
		for (var j = 0; j < indent; j++) {
			padding += '\t';
		}
		if (fromTo == 'opening->closing') {
			formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
		} else {
			formatted += padding + ln + '\n';
		}
	}

	return formatted;
};


/*	This work is licensed under Creative Commons GNU LGPL License.
License: http://creativecommons.org/licenses/LGPL/2.1/
Version: 0.9
Author:  Stefan Goessner/2006
Web:     http://goessner.net/
*/

/* Dan d/l from http://goessner.net/download/prj/jsonxml/
json2xml(obj, tab)
javascript object, tab or indent string for pretty output formatting omit or use empty string "" to supress.
returns XML string
*/
util.json.convertToXml = function (o, tab) {
	/*jshint eqeqeq:false */
	var toXml = function(v, name, ind) {
		var xml = "";
		if (v instanceof Array) {
			for (var i = 0, n = v.length; i < n; i++){
				xml += ind + toXml(v[i], name, ind + "\t") + "\n";
			}
		}
		else if (typeof (v) == "object") {
			var hasChild = false;
			xml += ind + "<" + name;
			for (var m in v) {
				if (m.charAt(0) == "@") {
					xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
				} else {
					hasChild = true;
				}
			}
			xml += hasChild ? ">" : "/>";
			if (hasChild) {
				for (m in v) {
					if (m == "#text") {
						xml += v[m];
					} else if (m == "#cdata") {
						xml += "<![CDATA[" + v[m] + "]]>";
					} else if (m.charAt(0) != "@") {
						xml += toXml(v[m], m, ind + "\t");
					}
				}
				xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
			}
		}
		else {
			if (v === undefined) { // custom by danbro 2011-07-04
				xml += ind + "<" + name + "></" + name + ">";
			} else {
				xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
			}
		}
		return xml;
	}, xml = "";
	for (var m in o) {
		xml += toXml(o[m], m, "");
	}
	return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
};

/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/
*/

/* Dan d/l from http://goessner.net/download/prj/jsonxml/
xml2json(xml, tab)
element or document DOM node tab or indent string for pretty output formatting omit or use empty string "" to supress.
returns JSON string
*/
util.xml.convertToJsonString = function (xml, tab) {
	/*jshint eqeqeq:false */
	var X = {
		toObj: function(xml) {
			var o = {};
			if (xml.nodeType==1) {   // element node ..
				if (xml.attributes.length) { // element with attributes  ..
					for (var i=0; i<xml.attributes.length; i++) {
						o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
					}
				}
				if (xml.firstChild) { // element has child nodes ..
					var textChild=0, cdataChild=0, hasElementChild=false;
					for (var n=xml.firstChild; n; n=n.nextSibling) {
						if (n.nodeType==1) {
							hasElementChild = true;
						} else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
							textChild++; // non-whitespace text
						} else if (n.nodeType==4) {
							cdataChild++; // cdata section node
						}
					}
					if (hasElementChild) {
						if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
							X.removeWhite(xml);
							for (n=xml.firstChild; n; n=n.nextSibling) {
								if (n.nodeType == 3) { // text node
									o["#text"] = X.escape(n.nodeValue);
								} else if (n.nodeType == 4) { // cdata node
										o["#cdata"] = X.escape(n.nodeValue);
								} else if (o[n.nodeName]) {  // multiple occurence of element ..
									if (o[n.nodeName] instanceof Array) {
										o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
									} else {
										o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
									}
								} else { // first occurence of element..
									o[n.nodeName] = X.toObj(n);
								}
							}
						} else { // mixed content
							if (!xml.attributes.length) {
								o = X.escape(X.innerXml(xml));
							} else {
								o["#text"] = X.escape(X.innerXml(xml));
							}
						}
					}  else if (textChild) { // pure text
						if (!xml.attributes.length) {
							o = X.escape(X.innerXml(xml));
						} else {
							o["#text"] = X.escape(X.innerXml(xml));
						}
					} else if (cdataChild) { // cdata
						if (cdataChild > 1) {
							o = X.escape(X.innerXml(xml));
						} else {
							for (n=xml.firstChild; n; n=n.nextSibling) {
								o["#cdata"] = X.escape(n.nodeValue);
							}
						}
					}
				}
				if (!xml.attributes.length && !xml.firstChild) {
					o = null;
				}
			}
			else if (xml.nodeType==9) { // document.node
				o = X.toObj(xml.documentElement);
			}
			else {
				window.alert("unhandled node type: " + xml.nodeType);
			}
			return o;
		},
		toJson: function(o, name, ind) {
			var json = (name) ? ("\""+name+"\"") : "";
			if (o instanceof Array) {
				for (var i=0,n=o.length; i<n; i++) {
					o[i] = X.toJson(o[i], "", ind+"\t");
				}
				json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
			} else if (o === null) {
				json += (name&&":") + "null";
			} else if (typeof(o) == "object") {
				var arr = [];
				for (var m in o) {
					arr[arr.length] = X.toJson(o[m], m, ind+"\t");
				}
				json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
			} else if (typeof(o) == "string") {
				json += (name&&":") + "\"" + o.toString() + "\"";
			} else {
				json += (name&&":") + o.toString();
			}
			return json;
		},
		innerXml: function(node) {
			var s = "";
			if ("innerHTML" in node) {
				s = node.innerHTML;
			} else {
				var asXml = function(n) {
					var s = "";
					if (n.nodeType == 1) {
						s += "<" + n.nodeName;
						for (var i=0; i<n.attributes.length;i++) {
							s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
						}
						if (n.firstChild) {
							s += ">";
							for (var c=n.firstChild; c; c=c.nextSibling) {
								s += asXml(c);
							}
							s += "</"+n.nodeName+">";
						} else {
							s += "/>";
						}
					} else if (n.nodeType == 3) {
						s += n.nodeValue;
					} else if (n.nodeType == 4) {
						s += "<![CDATA[" + n.nodeValue + "]]>";
					}
					return s;
				};
				for (var c=node.firstChild; c; c=c.nextSibling){
					s += asXml(c);
				}
			}
			return s;
		},
		escape: function(txt) {
			return txt.replace(/[\\]/g, "\\\\")
					.replace(/[\"]/g, '\\"')
					.replace(/[\n]/g, '\\n')
					.replace(/[\r]/g, '\\r');
		},
		removeWhite: function(e) {
			e.normalize();
			for (var n = e.firstChild; n; ) {
				if (n.nodeType == 3) {  // text node
					if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
						var nxt = n.nextSibling;
						e.removeChild(n);
						n = nxt;
					}
					else {
						n = n.nextSibling;
					}
				} else if (n.nodeType == 1) {  // element node
					X.removeWhite(n);
					n = n.nextSibling;
				} else { // any other node
					n = n.nextSibling;
				}
			}
			return e;
		}
	};
	if (xml.nodeType == 9) { // document node
		xml = xml.documentElement;
	}
	var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
};
// http://stackoverflow.com/questions/6507293/convert-xml-to-string-with-jquery
util.xml.convertToString = function (xmlData) {

	var xmlString;
	//IE
	if (window.ActiveXObject){
		xmlString = xmlData.xml;
	}
	// code for Mozilla, Firefox, Opera, etc.
	else{
		xmlString = (new XMLSerializer()).serializeToString(xmlData);
	}
	return xmlString;
};
