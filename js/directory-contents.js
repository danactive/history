/*global $, ajaxError, console, doT, util, window */
(function () {
	var qs = util.queryObj(),
		parent = window.walkPath.setParentFolderLink({"querystring": qs});
	function loadImages(response) {
		var arg = {},
			columns,
			html = [],
			sortArgs = { "connectWith": '.ui-sortable', "items": "> li[data-type=image]" };
		function generateThumbs(folder) {
			$.ajax({
				"url": '/admin/preview-generator',
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
		function distributeIntoColumns(items) {
			var columns = [[], [], []],
				i = 0,
				len = items.length;
			for (i; i < len; i++) {
				columns[Math.floor(i * columns.length / items.length)].push(items[i]);
			}
			return columns;
		}
		arg.qs = qs;
		columns = distributeIntoColumns(response.items);

		// Build HTML
		$.each(columns, function (i, column) {
			html.push("");
			$.each(column, function (j, item) {
				html[i] += doT["directory-list-item"](item, arg);
			});
		});
		
		//Push HTML to DOM
		$.each(html, function (i, htm) {
			$('.js-directory-list')
				.eq(i)
				.html(htm)
				.sortable(sortArgs);
		});

		if (qs.preview === "true") {
			generateThumbs(qs.folder);
		}
	}
	function bindEvents() {
		$("#btnRename, #btnResize").click(function ($event) {
			var $datepicker,
				isMoveToResize = this.id === "btnResize";
			$event.preventDefault();
			function getSelectedDate (formattedDate) {
				var currentFiles = [],
					newFiles = window.walkPath.getRenamedFiles({
						"filePrefix": formattedDate,
						"photosInDay": $(".js-directory-list").children('li[data-type=image]').length,
						"xmlStartPhotoId": (isMoveToResize === true) ? window.prompt("Starting XML photo ID?", 1) : 1
					}),
					year = formattedDate.substring(0, 4);

				// list of ordered filenames
				$('.js-directory-list').each(function (i, dom) {
					var $element = $(dom)
						filenames = [];
					if ($element.children().length !== 0) {
						filenames = $element.sortable( "toArray", {"attribute": 'data-filename'});
						currentFiles = currentFiles.concat(filenames);
					}
				});

				$datepicker.datepicker( "destroy" );

				$.ajax({
					"url": '/admin/rename-photos',
					"method": 'post',
					"data": {
						"targetFolderName": year,
						"currentFiles": currentFiles,
						"moveToResize": isMoveToResize,
						"newFiles": newFiles.filenames,
						"sourceFolderPath": qs.folder
					},
					"success": function (response) {
						var output = "";
						function resizeImage(postData) {
							$.ajax({
								"url": '/admin/resize-photo',
								"method": 'post',
								"data": postData,
								"error": ajaxError
							});
						}

						if (isMoveToResize === true) {
							$.each(response.files, function (x, file) {
								resizeImage(file.destination);
							});
							output = newFiles.xml;
						} else {
							output = "Rename successfull";
						}
						
						$("<textarea/>")
							.val(output)
							.appendTo("#controls");
					},
					"error": ajaxError
				});
			}
			$datepicker = $('<div id="vacationDate"></div>')
				.insertAfter(this)
				.datepicker({
					"dateFormat": 'yy-mm-dd',
					"onSelect": getSelectedDate,
					"changeMonth": true,
					"changeYear": true
				});
		});
	}
	function loadNav() {
		if (parent.text === "") {
			$("#btnParentFolder").addClass("hide");
		} else {
			$("#btnParentFolder")
				.removeClass("hide")
				.attr("href", parent.href)
				.find("#parentFolderName")
				.text(parent.text);
		}
	}
	$.ajax({
		"url": '/api/walk-path' + window.location.search,
		"success": loadImages,
		"error": ajaxError
	});
	loadNav();
	bindEvents();
})();