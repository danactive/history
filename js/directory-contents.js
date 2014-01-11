/*global $, ajaxError, doT, util, window */
function callThumbGenerator (folder) {
	$.ajax({
		"url": '/admin/thumb-generator',
		"method": 'post',
		"data": {
			"folder": folder
		},
		"success": function (response) {
			var qs = util.queryObj();
			$(".directory-thumb-wait").each(function (i) {
				this.src = "../../" + decodeURIComponent(qs.folder) + "/" + response.thumbnails[i];
				this.className = "directory-thumb";
			});
		},
		"error": ajaxError
	});
}
$.ajax({
	"url": '/api/walk-path' + window.location.search,
	"success": function (response) {
		var arg = {},
			out = [];
		arg.qs = util.queryObj();

		if (arg.qs.preview === "true") {
			callThumbGenerator(arg.qs.folder);
		}

		$.each(response.items, function (x, item) {
			out.push(doT["directory-list-item"](item, arg));
		});
		$('#directory-list').html(out.join('')).sortable();
	},
	"error": ajaxError
});