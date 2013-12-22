/*global $, ajaxError, doT, window */
$.ajax({
	"url": '/api/walk-path' + window.location.search,
	"success": function (response) {
		var out = [];
		$.each(response.items, function (x, item) {
			out.push(doT["directory-list-item"](item));
		});
		$('#directory-list').html(out.join(''));
	},
	"error": ajaxError
});