# How-to contribute to *history*

## Issues
* Improvements and conversations start with project issues
* There are two types of issues
  * Report a bug
  * Request a feature
* Enforced rules for new Issues
	* Issue title must be in imperative, present tense (e.g. "add", "fix", "change") [read more...](https://gitmagic.io/rules/#/issue/subject-must-be-in-tense)
	* Issue description cannot be empty [read more...](https://gitmagic.io/rules/#/issue/body-cannot-be-empty)
* New Issues will follow this [Issue Template](.github/ISSUE_TEMPLATE.md)
* More with GitHub.com documentation on [Mastering Issues](https://guides.github.com/features/issues/)

## Pull Requests (code review)
* Do not bump version or update changelog as it's manually triggered when released
* Enforced rules for new Pull Requests
	* Commit message subject must include a GitHub issue [read more...](https://gitmagic.io/rules/#/commit/subject-must-include-github-issue)
	* Pull request title must be in imperative, present tense (e.g. "add", "fix", "change") [read more...](https://gitmagic.io/rules/#/pull-request/subject-must-be-in-tense) 
	* Pull request description must include a screenshot [read more...](https://gitmagic.io/rules/#/pull-request/body-must-include-screenshot)
* New Pull Requests will follow this [PR Template](.github/PULL_REQUEST_TEMPLATE.md)
* Write unit tests to match existing test coverage
* More with GitHub.com documentation on [Contributing to a Project](https://guides.github.com/activities/contributing-to-open-source/#contributing)

## Commit message
* Strictly enforced [changelog convention](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)

# Developement
Ensure yarn is installed globally `npm install yarn --global`

## CLI commands
* `yarn lint` enforces code syntax quality
	* `yarn lint:filter plugins/video` apply lint to only video plugin folder
* `yarn test` execute unit tests with code coverage report
	* `yarn test:all --plugin=editAlbum` test and filter to specific plugin
	* `yarn test:react` test React.js views across all plugins

## Technologies

### Viewing
* XML databases for photo/video galleries
* Isomorphic React.js phasing out of JavaScript/jQuery for the pagination & lightbox

### Administration
* Node.js to support AJAX and image manipulation
* AJAX to read the XML gallery data


## Dependencies
Included in this project
* [jQuery](http://jquery.com/) via CDN
* [ColorBox (jQuery plugin)](http://www.jacklmoore.com/colorbox) via bower (stale)
* [MapBox GL JS (slippy map)](https://www.mapbox.com/mapbox-gl-js/api/) v0.27.0
* [Twitter Bootstrap (admin)](http://twitter.github.com/bootstrap/) v2.0.3
* [Fluid 960 Grid System (admin)](http://www.designinfluences.com/fluid960gs/)

To use the administration tools
* [node.js](http://nodejs.org/)
* [hapi.js](http://hapijs.org/)
* [GraphicsMagick](https://www.npmjs.com/package/gm) Install GraphicsMagick before npm

### Adding dependencies to project
* Update **package.json** with `yarn`
	* Install project dependencies `yarn add [module]`

## Photo/video album XML schemas
### Current schema (2.0)

Example

	<album>
		<meta>
			<gallery>demo</gallery> <!-- gallery directory name excluding 'gallery-'; new in schema 2.0 -->
			<id>sample</id> <!--Filename is album_sample.xml; new in schema 2.0-->
			<version>1.8</version> <!--Reference schema version; new in schema 2.0-->
		</meta>
		<item><!-- photo -->
			<id>1</id> <!-- id attribute must be unique for this album; used by JavaScript & for character association -->
			<filename>2001-03-21-01.jpg</filename> <!-- must start with YYYY year; photos and thumbs must be places in this folder too -->
			<geo> <!-- geocode -->
				<lat>49.25</lat> <!-- latitude -->
				<lon>-123.1</lon> <!-- longitude -->
			</geo>
			<photo_city>Vancouver, BC</photo_city> <!-- Political location name often City, Province/State -->
			<photo_loc>Granville Island</photo_loc> <!-- General location name often neighourhood or building -->
			<photo_desc>An oversized avocado</photo_desc> <!-- The photo description only viewable in the lightbox view -->
			<thumb_caption>Lunch</thumb_caption> <!-- Less than three words to descibe the thumbnail in gallery view -->
		</item>
		<item><!-- video -->
			<type>video</type>
			<id>1</id> <!-- id attribute must be unique for this album; used by JavaScript & for character association -->
			<filename>2012-fireplace.mp4</filename> <!-- History supports both HTML5 video formats for best browser support; must start with YYYY year; photos and thumbs must be places in this folder too -->
			<filename>2012-fireplace.webm</filename>
			<photo_city>Vancouver, BC</photo_city>
			<photo_loc>Home</photo_loc>
			<thumb_caption>Video: Fireplace</thumb_caption>
			<photo_desc>A sample HTML5 video in both MP4 and WebM formats</photo_desc>
			<size><w>1280</w><h>720</h></size> <!-- Dimensions for opening the popup window and enlarging the HTML5 video -->
			<geo>
				<lat>49.25</lat>
				<lon>-123.1</lon>
			</geo>
		</item>
	</album>
