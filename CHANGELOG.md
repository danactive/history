# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.8.0"></a>
# [1.8.0](https://github.com/danactive/history/compare/v1.7.0...v1.8.0) (2016-11-13)


### Bug Fixes

* **Dependencies:** Remove yarn warning for babel ([1369e48](https://github.com/danactive/history/commit/1369e48))


### Features

* **View Album:** Caption supports video ([5465ae8](https://github.com/danactive/history/commit/5465ae8))
* **View Album:** Lightbox (legacy) scripts applied to load thumbnail ([#31](https://github.com/danactive/history/issues/31)) ([af1cd05](https://github.com/danactive/history/commit/af1cd05))
* **View Album:** Linted lightbox (legacy) scripts applied to load photo ([#31](https://github.com/danactive/history/issues/31)) ([c1968d4](https://github.com/danactive/history/commit/c1968d4))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/danactive/history/compare/v1.6.0...v1.7.0) (2016-11-13)


### Features

* **View Album:** Display Thumbnail captions ([#29](https://github.com/danactive/history/issues/29)) ([eba3486](https://github.com/danactive/history/commit/eba3486))
* **View Album:** Dynamic thumbnail path ([#32](https://github.com/danactive/history/issues/32)) ([c6ca9a7](https://github.com/danactive/history/commit/c6ca9a7))
* **View Album:** Thumbnail captions needs testing and styling ([88df5bc](https://github.com/danactive/history/commit/88df5bc))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/danactive/history/compare/v1.5.1...v1.6.0) (2016-11-09)


### Bug Fixes

* **Test:** Enable resize and measure image ([34d0bc9](https://github.com/danactive/history/commit/34d0bc9))


### Features

* **View Album:** Thumbnail images layout [#20](https://github.com/danactive/history/issues/20) ([f4f2c56](https://github.com/danactive/history/commit/f4f2c56))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/danactive/history/compare/1.5.0...v1.5.1) (2016-11-08)


### Bug Fixes

* **lint:** Lock dependencies for lint ([#28](https://github.com/danactive/history/issues/28)) ([1721063](https://github.com/danactive/history/commit/1721063))
* **lint:** Use function since no state ([6341b94](https://github.com/danactive/history/commit/6341b94))
* **lint:** Use propTypes to avoid runtime React warnings ([bc937da](https://github.com/danactive/history/commit/bc937da))
* **react:** Rename view to component name ([a39683c](https://github.com/danactive/history/commit/a39683c))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/danactive/history/compare/v1.3.2...v1.5.0) (2016-11-08)


### Bug Fixes

* **ci:** Correct Travis filename ([0632746](https://github.com/danactive/history/commit/0632746))
* **ci:** Disable Windows only test ([44c87c7](https://github.com/danactive/history/commit/44c87c7))
* **ci:** Drop node.js 5 ([b8ab6d4](https://github.com/danactive/history/commit/b8ab6d4))
* **ci:** Drop node.js 6.0.0 ([189d5f2](https://github.com/danactive/history/commit/189d5f2))
* **ci:** Drop plugin node_modules, and force update to root ([d35ac5a](https://github.com/danactive/history/commit/d35ac5a))
* **ci:** Install GraphicsMagick for Travis to pass tests ([0a090cf](https://github.com/danactive/history/commit/0a090cf))
* **ci:** Prevent yarn from deleting server.js ([67409d2](https://github.com/danactive/history/commit/67409d2))
* **ci:** Run Windows test on Windows ([ee39bdc](https://github.com/danactive/history/commit/ee39bdc))
* **ci:** Temp disable resize test to pass in CI ([fec87ac](https://github.com/danactive/history/commit/fec87ac))
* **ci:** Travis badge ([e0e3849](https://github.com/danactive/history/commit/e0e3849))
* **ci:** Travis runs Plugins test and lint in parallel ([0d1d1b8](https://github.com/danactive/history/commit/0d1d1b8))
* **ci:** Yarn for packages ([4dba927](https://github.com/danactive/history/commit/4dba927))


### Features

* **album:** Display a list of filenames ([e19cc0d](https://github.com/danactive/history/commit/e19cc0d))
* **ci:** Add Travis CI ([#21](https://github.com/danactive/history/issues/21)) ([c15c7a2](https://github.com/danactive/history/commit/c15c7a2))
* **test:** All Plugin tests and lint pass ([#17](https://github.com/danactive/history/issues/17)) ([6428c5e](https://github.com/danactive/history/commit/6428c5e))



# Changelog

### 1.4.1 - Admin resize folder
#### todo
* (Fix) Walk photos - rename and move success

### 1.4.0 - Admin resize file
#### 2016-Oct-22
* (Add) Resize plugin
* (Add) Log plugin
* (Add) Utilities plugin
* (Add) Yarn v1 lock file added

### 1.3.2 - Plugins linted
#### 2016-Oct-16
* (Fix) All tests pass - both `npm test` and individually
* (Fix) Plugin dependencies updated

### 1.3.1 - XML v2.0 continuation
#### 2016-Sep-05
* (Fix) Video playback
* (Fix) sample XML and README documentation

### 1.3.0 - hapi plugins for exists and rename
#### 2016-Feb-09
* Exist green code coverage
* Rename green code coverage
* Dev-mode no gulp

### 1.2.0 - hapi.js v12
#### 2016-Jan-30

### 1.1.0 - Up-to-date and passes
#### 2016-Jan-24
* All tests pass
* Update dependencies

### 1.0.0 - Replace express.js for hapi.js
#### 2015-Feb-15
* Replace grunt.js with gulp.js 
* Mostly async using callbacks and promises
* Restructure folders to public and src

### 0.20.0 - Rename and move meta files like RAW and movies
#### 2014-Dec-21

### 0.19.0 - Isolate XML for future JSON
#### 2014-Dec-20

### 0.18.0 - Add Flickr full justified gallery
#### 2014-Sep-14

### 0.17.0 - Generate thumbs
#### 2014-Jan-10

### 0.16.0 - Add unit test
#### 2014-Jan-05

### 0.15.0 - Grunt.js workflow
#### 2014-Jan-04
* Change front-end folder structure to tech languages
* Admin use Node.js Grunt.js to control front-end and admin workflow
* Add admin walk todo photo directories

### 0.14.0 - Upgrade gallery map from Google to Leaflet with Mapstraction
#### 2013-Aug-29
* Works in Firefox, Chrome

### 0.13.0 - Admin - drag to resize many photo and thumbs
#### 2013-Aug-05
* Works in Firefox

### 0.12.0 - Upgrade admin map to mapstraction
#### 2013-Jan-21

### 0.11.0 - Simplify webserver
#### 2012-Jun-09

### 0.10.0 - Documentation improvements
#### 2012-May-22

### 0.9.0 - Support multiple galleries (Major update)
#### 2012-May-21
* This structure change makes it easier to seperate the history application from the personal content
* Demo gallery moved to the gallery-demo folder
* Album XML schema updated (1.8) to reflect folder name

### 0.8.0 - New admin page: Image manipulation to produce thumbnails 185x45 and move images to photos folder
#### 2012-May-20

### 0.7.0 - New admin page: edit existing albums (XML generation)
#### 2012-May-07

### 0.6.0 - added ability for viewing of HTML5 videos
#### 2012-May-06

###0.5.0 - added Node.js for admin section
#### 2012-May-06
* (Fix) Character association 
* (Add) Node.js modules Express & GraphicsMagick
* (Add) Admin: Get getcode from map

### 0.4.0 - viewing of photos
#### 2012-May-03
* Sample album with three Vancouver markers on map
* jQuery v1.7.2
* Mapstraction Build 2.0.18 - pre-release using Google Maps v3
* ColorBox v1.3.19
