/*global $, ajaxError, console, doT, util, window */
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
		$('#directory-list').html(out.join('')).sortable({ "axis": 'y', "items": "> li[data-type=image]" });
	},
	"error": ajaxError
});
$("#btnFinalize").click(function ($event) {
	var $datepicker;
	function getSelectedDate (formattedDate) {
		var photoCount = $('#directory-list > li[data-type=image]').length,
			newFiles = window.resizeRenamePhotos.getRenamedFiles({"filePrefix": formattedDate, "photosInDay": photoCount}),
			currentFiles = $('#directory-list').sortable( "toArray", {"attribute": 'data-filename'} ),
			qs = util.queryObj(),
			year = formattedDate.substring(0, 4);
		$datepicker.datepicker( "destroy" );

		$.ajax({
			"url": '/admin/resize-photos',
			"method": 'post',
			"data": {
				"folderName": year,
				"currentFiles": currentFiles,
				"newFiles": newFiles.filenames,
				"sourceFolderPath": qs.folder
			},
			"success": function (response) {
				console.log(response); // todo
			},
			"error": ajaxError
		});
	}
	$datepicker = $('<div id="vacationDate"></div>')
		.insertAfter(this)
		.datepicker({
			"dateFormat": 'yy-mm-dd',
			"onSelect": getSelectedDate
		});
	$event.preventDefault();
});