/*global $, ajaxError, console, doT, util, window */
(function () {
	var qs = util.queryObj(),
		parent = window.walkPath.setParentFolderLink({"querystring": qs});
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
	$.ajax({
		"url": '/api/walk-path' + window.location.search,
		"success": function (response) {
			var arg = {},
				itemHalf,
				out1 = [],
				out2 = [];
			arg.qs = qs;

			if (qs.preview === "true") {
				callThumbGenerator(qs.folder);
			}

			itemHalf = response.items.length / 2;
			$.each(response.items, function (i, item) {
				if (i < itemHalf) {
					out1.push(doT["directory-list-item"](item, arg));
				} else {
					out2.push(doT["directory-list-item"](item, arg));
				}
			});
			$('#directory-list-1').html(out1.join('')).sortable({ "connectWith": '#directory-list-2', "items": "> li[data-type=image]" });
			$('#directory-list-2').html(out2.join('')).sortable({ "connectWith": '#directory-list-1', "items": "> li[data-type=image]" });
		},
		"error": ajaxError
	});
	$("#btnFinalize").click(function ($event) {
		var $datepicker;
		$event.preventDefault();
		function getSelectedDate (formattedDate) {
			var photoCount1 = $('#directory-list-1 > li[data-type=image]').length,
				photoCount2 = $('#directory-list-2 > li[data-type=image]').length,
				newFiles = window.walkPath.getRenamedFiles({"filePrefix": formattedDate, "photosInDay": (photoCount1 + photoCount2), "xmlStartPhotoId": window.prompt("Starting XML photo ID?", 1)}),
				currentFiles = [],
				currentFiles1 = $('#directory-list-1').sortable( "toArray", {"attribute": 'data-filename'} ),
				currentFiles2 = $('#directory-list-2').sortable( "toArray", {"attribute": 'data-filename'} ),
				year = formattedDate.substring(0, 4);
			currentFiles = currentFiles1.concat(currentFiles2);
			currentFiles1 = undefined;
			currentFiles2 = undefined;
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
						.insertBefore("#directory-list-1");
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
	});
	if (parent.text === "") {
		$("#btnParentFolder").addClass("hide");
	} else {
		$("#btnParentFolder")
			.removeClass("hide")
			.attr("href", parent.href)
			.find("#parentFolderName")
			.text(parent.text);
	}
})();