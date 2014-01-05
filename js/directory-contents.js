/*global $, ajaxError, doT, util, window */
function callThumbGenerator (folder) {
	$.ajax({
		"url": '/admin/thumb-generator',
		"method": 'post',
		"data": {
			"folder": folder
		},
		"success": function (response) {
			
		},
		"error": ajaxError
	});
}
$.ajax({
	"url": '/api/walk-path' + window.location.search,
	"success": function (response) {
		var args = {},
			out = [];
		args.qs = util.queryObj();

		if (args.qs.preview === "true") {
			callThumbGenerator(args.qs.folder);
		}

		$.each(response.items, function (x, item) {
			out.push(doT["directory-list-item"](item, args));
		});
		$('#directory-list').html(out.join(''));
	},
	"error": ajaxError
});