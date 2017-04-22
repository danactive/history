# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.1.0"></a>
# [2.1.0](https://github.com/danactive/history/compare/v2.0.0...v2.1.0) (2017-04-22)


### Bug Fixes

* **CI:** Change CI to test webpack [[#149](https://github.com/danactive/history/issues/149)] ([c1e3446](https://github.com/danactive/history/commit/c1e3446))
* **CLI:** Display favicon with server start event notification ([8b52867](https://github.com/danactive/history/commit/8b52867))
* **package:** update babel-loader to version 7.0.0 ([a6ff5fa](https://github.com/danactive/history/commit/a6ff5fa))
* **package:** update node-notifier to version 5.0.1 ([f807df3](https://github.com/danactive/history/commit/f807df3)), closes [#111](https://github.com/danactive/history/issues/111)
* **webpack:** Absolute path & Lint ([84312e0](https://github.com/danactive/history/commit/84312e0))
* **webpack:** webpack v2 failed on Windows 7, trailing commas was part of the error ([409d2b1](https://github.com/danactive/history/commit/409d2b1))


### Features

* **CI:** Add Windows CI hosted by AppVeyor [[#149](https://github.com/danactive/history/issues/149),[#92](https://github.com/danactive/history/issues/92)] ([e47a02f](https://github.com/danactive/history/commit/e47a02f))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/danactive/history/compare/v1.16.0...v2.0.0) (2017-01-27)


### Bug Fixes

* **Repo:** Change PR rules to allow Greenkeeper to create [[#98](https://github.com/danactive/history/issues/98)] ([a869c1d](https://github.com/danactive/history/commit/a869c1d))
* **Repo:** Remove deprecated flles and folders [[#101](https://github.com/danactive/history/issues/101)] ([f9b20af](https://github.com/danactive/history/commit/f9b20af))


### Features

* **View Album:** Change HTML5 video to preload, autoplay and use JPEG poster [[#104](https://github.com/danactive/history/issues/104)] ([9c7b566](https://github.com/danactive/history/commit/9c7b566))


### BREAKING CHANGE

* **Repo:** Change gallery folder for improved security [[#105](https://github.com/danactive/history/issues/105)] ([54396b0](https://github.com/danactive/history/commit/54396b0))
	* Move folder from `/gallery-demo` to `/public/galleries/gallery-demo`



<a name="1.16.0"></a>
# [1.16.0](https://github.com/danactive/history/compare/v1.15.0...v1.16.0) (2017-01-12)


### Bug Fixes

* **CI:** DRY to improve Code Climate check [[#90](https://github.com/danactive/history/issues/90)] ([ada4946](https://github.com/danactive/history/commit/ada4946))
* **Edit Admin:** Add validation for untrusted input in path [[#62](https://github.com/danactive/history/issues/62)][[#81](https://github.com/danactive/history/issues/81)] ([675c401](https://github.com/danactive/history/commit/675c401))
* **Lint:** Change lint from gulp to npm with same functionality [[#49](https://github.com/danactive/history/issues/49)] ([a8a845f](https://github.com/danactive/history/commit/a8a845f))
* **View Album:** Add Wikipedia link conditionally to lightbox title [[#70](https://github.com/danactive/history/issues/70)] ([ea21344](https://github.com/danactive/history/commit/ea21344))
* **View Album:** Display satellite tiles on map [[#90](https://github.com/danactive/history/issues/90)] ([09c6885](https://github.com/danactive/history/commit/09c6885))
* **View Album:** Remove Wikipedia link from legacy code [[#70](https://github.com/danactive/history/issues/70)] ([3c52f8b](https://github.com/danactive/history/commit/3c52f8b))
* **View Album:** Slippy map plots gallery and album data [[#39](https://github.com/danactive/history/issues/39)] ([4015e22](https://github.com/danactive/history/commit/4015e22))


### Features

* **GeoJSON:** Add plugin to request album as GeoJSON [[#90](https://github.com/danactive/history/issues/90)] ([c68f258](https://github.com/danactive/history/commit/c68f258))
* **View Album:** Change marker clustering to be coloured by density [[#39](https://github.com/danactive/history/issues/39)] ([251b09d](https://github.com/danactive/history/commit/251b09d))
* **View Album:** Pan and zoom map to pin based on lightbox photo geocode [[#90](https://github.com/danactive/history/issues/90)] ([26c6cdc](https://github.com/danactive/history/commit/26c6cdc))



<a name="1.15.0"></a>
# [1.15.0](https://github.com/danactive/history/compare/v1.14.0...v1.15.0) (2016-12-27)


### Features

* **Repo:** Add template for new GitHub Issues [[#71](https://github.com/danactive/history/issues/71)] ([830d266](https://github.com/danactive/history/commit/830d266))
* **Repo:** Add template for new Pull Requests [[#71](https://github.com/danactive/history/issues/71)] ([d590cca](https://github.com/danactive/history/commit/d590cca))



<a name="1.14.0"></a>
# [1.14.0](https://github.com/danactive/history/compare/v1.13.0...v1.14.0) (2016-12-20)


### Bug Fixes

* **Edit Album:** Power user may save with enter then navigate with arrow keys ([e13adc6](https://github.com/danactive/history/commit/e13adc6))
* **View Album:** Change colorbox to latest version [[#70](https://github.com/danactive/history/issues/70)] ([5132cc6](https://github.com/danactive/history/commit/5132cc6))
* **View Album:** Change ColorThieft to work with colorbox [[#70](https://github.com/danactive/history/issues/70)] ([e339646](https://github.com/danactive/history/commit/e339646))
* **CI:** Lint [[#72](https://github.com/danactive/history/issues/72)] ([6960b65](https://github.com/danactive/history/commit/6960b65))


### Features

* **CI:** Enable SourceClear [[#72](https://github.com/danactive/history/issues/72)] ([15dc85f](https://github.com/danactive/history/commit/15dc85f))
* **View Album:** Webpack serving CSS and JS for jQuery colobox v1.5.10 [[#70](https://github.com/danactive/history/issues/70)] ([edc4804](https://github.com/danactive/history/commit/edc4804))



<a name="1.13.0"></a>
# [1.13.0](https://github.com/danactive/history/compare/v1.12.1...v1.13.0) (2016-12-11)


### Bug Fixes

* **Badge:** Add coverage badge [[#34](https://github.com/danactive/history/issues/34)] ([902d557](https://github.com/danactive/history/commit/902d557))
* **CI:** Ensure lint breaks the build [[#66](https://github.com/danactive/history/issues/66)] ([62ceb5c](https://github.com/danactive/history/commit/62ceb5c))
* **CI:** Remove nsp with gulp and GitHub.com integration with NSP and Snyk [[#66](https://github.com/danactive/history/issues/66)] ([9364f79](https://github.com/danactive/history/commit/9364f79))
* **Edit Album:** TabIndex to positive for keyboard tab order [[#68](https://github.com/danactive/history/issues/68)] ([0e3d4bc](https://github.com/danactive/history/commit/0e3d4bc))
* **Lint:** Add blank test for coverage report [[#66](https://github.com/danactive/history/issues/66)] ([090a899](https://github.com/danactive/history/commit/090a899))
* **README:** Table of service badges ([0db22f7](https://github.com/danactive/history/commit/0db22f7))


### Features

* **Coverage:** Istanbul (nyc) test coverage for all plugin spec files [[#34](https://github.com/danactive/history/issues/34)] ([eec81c4](https://github.com/danactive/history/commit/eec81c4))
* **Coverage:** React test sample ([b7f975a](https://github.com/danactive/history/commit/b7f975a))
* **Dev:** Allow specific plugins to filter gulp task sources: lint ([57e159a](https://github.com/danactive/history/commit/57e159a))
* **Dev:** Allow specific plugins to filter gulp task sources: test ([#49](https://github.com/danactive/history/issues/49)) ([eef6b37](https://github.com/danactive/history/commit/eef6b37))
* **Dev:** Enforce commit, pull request, and issue rules ([#60](https://github.com/danactive/history/issues/60)) ([23ef4ee](https://github.com/danactive/history/commit/23ef4ee))
* **LICENSE:** 2016 MIT license ([00bc223](https://github.com/danactive/history/commit/00bc223))



<a name="1.12.1"></a>
## [1.12.1](https://github.com/danactive/history/compare/v1.12.0...v1.12.1) (2016-12-05)


### Bug Fixes

* **package:** Yarn lock to match package.json ([25f1531](https://github.com/danactive/history/commit/25f1531))



<a name="1.12.0"></a>
# [1.12.0](https://github.com/danactive/history/compare/v1.11.1...v1.12.0) (2016-12-05)


### Bug Fixes

* **Edit Album:** Lint jQuery legacy scripts ([#50](https://github.com/danactive/history/issues/50)) ([8448ce9](https://github.com/danactive/history/commit/8448ce9))
* **package:** update hapi to version 16.0.0 ([b922678](https://github.com/danactive/history/commit/b922678))
* **package:** update standard-version to version 4.0.0 ([31f67d2](https://github.com/danactive/history/commit/31f67d2))


### Features

* **Test Coverage:** Test one React view using react-addons-test-utils ([#34](https://github.com/danactive/history/issues/34)) ([9b08bc7](https://github.com/danactive/history/commit/9b08bc7))
* **Edit Album:** Isomorphically change gallery (#54) Introduce webpack



<a name="1.11.1"></a>
## [1.11.1](https://github.com/danactive/history/compare/v1.11.0...v1.11.1) (2016-11-27)


### Bug Fixes

* **CI:** Remove unused legacy scripts ([0bb7e2d](https://github.com/danactive/history/commit/0bb7e2d))



<a name="1.11.0"></a>
# [1.11.0](https://github.com/danactive/history/compare/v1.10.0...v1.11.0) (2016-11-26)


### Bug Fixes

* **CI:** Disable Code Climate until eslint 3 is supported ([#45](https://github.com/danactive/history/issues/45)) ([8c7bc21](https://github.com/danactive/history/commit/8c7bc21))
* **CI:** Remove vulnerabilities: dustjs-linkedin ([#42](https://github.com/danactive/history/issues/42)) ([2460f94](https://github.com/danactive/history/commit/2460f94))
* **CI:** Task NSP executed by CI ([#42](https://github.com/danactive/history/issues/42)) ([eadf341](https://github.com/danactive/history/commit/eadf341))
* **CI:** Use CDN for jQuery UI not hosted locally ([17b1ec2](https://github.com/danactive/history/commit/17b1ec2))
* **CI:** Verify Code Climate will read master branch ([#45](https://github.com/danactive/history/issues/45) [#47](https://github.com/danactive/history/issues/47)) ([8175931](https://github.com/danactive/history/commit/8175931))
* **Lint:** Apply ignore for third party libraries and legacy scripts ([#45](https://github.com/danactive/history/issues/45)) ([0a23b78](https://github.com/danactive/history/commit/0a23b78))
* **Lint:** yarn lint uses gulp and yarn eslint uses native eslint: both pass ([#45](https://github.com/danactive/history/issues/45)) ([75e7a3e](https://github.com/danactive/history/commit/75e7a3e))


### Features

* **Edit Album:** Gallery dropdown populated with React ([#46](https://github.com/danactive/history/issues/46)) ([92b5f7b](https://github.com/danactive/history/commit/92b5f7b))
* **Edit Album:** Legacy jQuery code but functional ([#46](https://github.com/danactive/history/issues/46)) ([a243b06](https://github.com/danactive/history/commit/a243b06))
* **Edit Album:** UI using React.js ([#46](https://github.com/danactive/history/issues/46)) ([0a1af6f](https://github.com/danactive/history/commit/0a1af6f))
* **View Album:** Admin using React.js view engine ([#42](https://github.com/danactive/history/issues/42)) ([ee6254c](https://github.com/danactive/history/commit/ee6254c))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/danactive/history/compare/v1.9.0...v1.10.0) (2016-11-19)


### Bug Fixes

* **caption:** Switch definitions: caption is generic and thumbCaption is specific to thumbnails with Video prefix ([a3a5bc7](https://github.com/danactive/history/commit/a3a5bc7))
* **joi:** Update code for breaking change of joi dependency ([e7ba3af](https://github.com/danactive/history/commit/e7ba3af))
* **View Gallery:** Gallery list links to View Album (plugin); delete deprecated mapstraction ([#44](https://github.com/danactive/history/issues/44)) ([cf055f6](https://github.com/danactive/history/commit/cf055f6))


### Features

* **View Album:** Video player support multiple codec formats ([#43](https://github.com/danactive/history/issues/43)) ([082500f](https://github.com/danactive/history/commit/082500f))
* **View Album:** Video plays in lightbox of photo album ([#43](https://github.com/danactive/history/issues/43)) ([1e194ea](https://github.com/danactive/history/commit/1e194ea))



<a name="1.9.0"></a>
# [1.9.0](https://github.com/danactive/history/compare/v1.8.0...v1.9.0) (2016-11-18)


### Bug Fixes

* **package:** update joi to version 10.0.0 ([c56106d](https://github.com/danactive/history/commit/c56106d))


### Features

* **CI:** Add project dependency badges ([#23](https://github.com/danactive/history/issues/23)) ([7377878](https://github.com/danactive/history/commit/7377878))
* **CI:** Test reporter to summarize fail ([#33](https://github.com/danactive/history/issues/33)) ([f74e776](https://github.com/danactive/history/commit/f74e776))
* **Map Album:** Add MapBox GL JS to right split view ([#36](https://github.com/danactive/history/issues/36)) ([b56ea2d](https://github.com/danactive/history/commit/b56ea2d))
* **Map Album:** Plot markers with thumb icon, center to first marker ([#40](https://github.com/danactive/history/issues/40)) ([c083190](https://github.com/danactive/history/commit/c083190))
* **View Album Map:** Map it button w/ split view ([#35](https://github.com/danactive/history/issues/35)) ([143e191](https://github.com/danactive/history/commit/143e191))



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
