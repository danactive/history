/*global $*/
/* Version 1.0 */
var buildHtml = function(arr) { // input arr is an array of objects
	$.each(arr, function(a, html) { // html is an obj of HTML node/value pairs; duplicate HTML tags not allowed in JSON
		$.each(html, function(node, val) {
			if (node === 'ul') { // val is an array of <li>
				var ul = $('<ul/>');
				$.each(val, function(i, txt) {
					$('<li/>').text(txt).appendTo(ul);
				});
				ul.appendTo('body');
			} else { // val is text
				if ($.isArray(val)) { // id, txt
					$('<' + node + '/>').
						attr('id', val[0]).
						text(val[1]).
						appendTo('body');
				} else { // txt
					$('<' + node + '/>').text(val).appendTo('body');
				}
			}
		});
	});
}
var ajaxError = function(jqXHR, textStatus, errorThrown) { debugger; /* run as localhost */ }