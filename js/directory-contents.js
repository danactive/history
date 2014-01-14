/*global $, ajaxError, console, doT, util, window */
(function () {
	var qs = util.queryObj();
	function callThumbGenerator (folder) {
		$.ajax({
			"url": '/admin/thumb-generator',
			"method": 'post',
			"data": {
				"folder": folder
			},
			"success": function (response) {
				$(".directory-thumb-wait").each(function (i) {
					this.src = "../../" + decodeURIComponent(qs.folder) + "/" + response.thumbnails[i];
					this.className = "directory-thumb";
				});
			},
			"error": ajaxError
		});
	}
	(function setParentFolderLink() {
		var name = "",
			newQs = [],
			path = qs.folder.split("/");
		name = path.pop();
		if (name === "") {
			path.pop();
		}
		name = path[path.length-1];
		$.each(qs, function (key, value) {
			if (key === "folder") {
				newQs.push(key + "=" + path.join("/") + "/");
			} else {
				newQs.push(key + "=" + value);
			}
		});
		$("#btnParentFolder")
			.attr("href", "?" + newQs.join("&"))
			.find("#parentFolderName")
			.text(decodeURIComponent(name));
	})();
	$.ajax({
		"url": '/api/walk-path' + window.location.search,
		"success": function (response) {
			var arg = {},
				out = [];
			arg.qs = qs;

			if (qs.preview === "true") {
				callThumbGenerator(qs.folder);
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
				newFiles = window.resizeRenamePhotos.getRenamedFiles({"filePrefix": formattedDate, "photosInDay": photoCount, "xmlStartPhotoId": window.prompt("Starting XML photo ID?", 1)}),
				currentFiles = $('#directory-list').sortable( "toArray", {"attribute": 'data-filename'} ),
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
					// kill photos
					// display XML
					$("<textarea/>")
						.val(newFiles.xml)
						.insertBefore("#directory-list");
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
})();