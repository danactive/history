/*global $, ajaxError, doT, util, window */
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
			var columns = [[], [], [], [], [], []],
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
			$('.js-directory-column')
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
				isMoveToResize = (this.id === "btnResize"),
				generateFilenames,
				xmlOutput = "";
			$event.preventDefault();
		
			$datepicker = $('<div id="vacationDate"></div>')
				.insertAfter(this)
				.datepicker({
					"changeMonth": true,
					"changeYear": true,
					"dateFormat": 'yy-mm-dd',
					"onSelect": function (formattedDate) {
						$datepicker.datepicker( "destroy" );

						$.ajax({
							"url": '/admin/rename-assets',
							"method": 'post',
							"data": {
								"moveToResize": isMoveToResize,
								"assets": generateFilenames(formattedDate)
							},
							"success": function (response) {
								var $spinner = $("#spinner"),
									ajaxCounter = 0,
									deleteTempThumb = function () {
										$.ajax({
											"url": '/admin/delete-path',
											"method": 'post',
											"data": {
												"tempThumbFolder": qs.folder
											},
											"error": ajaxError,
											"complete": spinner
										});
									},
									photoCount = 1,
									output = "",
									resizeImage = function (postData) {
										$.ajax({
											"url": '/admin/resize-photo',
											"method": 'post',
											"data": postData,
											"error": ajaxError,
											"complete": spinner
										});
									},
									spinner = function () {
										ajaxCounter++;
										if (photoCount === ajaxCounter) {
											$spinner.addClass("hide");
										}
									};

								if (isMoveToResize === true) {
									$spinner.removeClass("hide");
									$.each(response.assets, function (x, asset) {
										if (asset.mediaType === "image") {
											photoCount++;
											resizeImage(asset);
										}
									});
									deleteTempThumb();
									output = xmlOutput;
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
				}); // datepicker

			generateFilenames = function (datePrefix) {
				var generated,
					photoCount = $(".js-directory-column").children('li[data-type=image]').length,
					targetFolder = datePrefix.substring(0, 4) + "/";

				generated = window.walkPath.getRenamedFiles({
					"filePrefix": datePrefix,
					"photosInDay": photoCount,
					"xmlStartPhotoId": (isMoveToResize === true) ? window.prompt("Starting XML photo ID?", 1) : 1
				});

				xmlOutput = generated.xml;

				return getSortedAssets(generated.files, generated.filenames, targetFolder, qs.folder);
			};
		}); // click
	}
	function getSortedAssets(renamedFiles, renamedFilenames, targetFolder, sourceFolder) {
		var draggableIndex = -1,
			out = {
				"sort": []
			};
		// list of ordered filenames
		$('.js-directory-column').each(function (x, column) {
			var $asset,
				$column = $(column),
				$photo,
				rawIds = [], // sortable image filenames
				renamedId;
			if ($column.children().length <= 0) {
				return true; // continue
			}
			rawIds = $column.sortable( "toArray");

			$.each(rawIds, function (i) {
				draggableIndex++;
				renamedId = renamedFiles[draggableIndex];
				$photo = $("#" + rawIds[i]);
				out.sort.push(renamedId);
				out[renamedId] = {
					"files": []
				};
				$('.js-directory-column > li[data-file=' + $photo.attr("data-file") + ']').each(function (xx, asset) {
					$asset = $(asset);
					out[renamedId].files.push({
						"mediaType": $asset.attr("data-type"),
						"moved": targetFolder + renamedFiles[draggableIndex] + $asset.attr("data-ext"),
						"raw": sourceFolder + $asset.attr("data-filename"),
						"renamed": sourceFolder + renamedFiles[draggableIndex] + $asset.attr("data-ext")
					});
				});
			});
		});
		return out;
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