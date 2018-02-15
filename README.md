# history

Your personal **history** storyboarded with photo and video albums. Associate photos with their meta data including geocode, caption... in XML albums.
* Enhanced privacy as photos are stored locally not in the cloud
* Plot thumbnails on a map
* Includes administration tools for XML generation

## Project Status:
| Service | Status |
|---|---|
| CI | [![Build Status](https://travis-ci.org/danactive/history.png?branch=master)](https://travis-ci.org/danactive/history) [![Windows build status](https://ci.appveyor.com/api/projects/status/df0s6b0wrdv0akkd?svg=true)](https://ci.appveyor.com/project/danactive/history/branch/master) |
| Dependencies | [![Dependencies Status](https://david-dm.org/danactive/history.svg)](https://david-dm.org/danactive/history) [![DevDependencies Status](https://david-dm.org/danactive/history/dev-status.svg)](https://david-dm.org/danactive/history#info=devDependencies) |
| Code Quality | [![Code Climate](https://codeclimate.com/github/danactive/history/badges/gpa.svg)](https://codeclimate.com/github/danactive/history) [![BCH compliance](https://bettercodehub.com/edge/badge/danactive/history?branch=master)](https://bettercodehub.com/) |
| Security | [![NSP Status](https://nodesecurity.io/orgs/danactive/projects/86c4bdca-2365-43a7-b863-8dd4c21b021f/badge)](https://nodesecurity.io/orgs/danactive/projects/86c4bdca-2365-43a7-b863-8dd4c21b021f) [![Known Vulnerabilities](https://snyk.io/test/github/danactive/history/badge.svg)](https://snyk.io/test/github/danactive/history) |
| Test Coverage | [![Coverage Status](https://coveralls.io/repos/github/danactive/history/badge.svg?branch=master)](https://coveralls.io/github/danactive/history?branch=master) |
| License | [![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT) |

## Installation
1. Node.js v8.6.x LTS [Download](https://nodejs.org/)
1. Install project dependencies `npm install` (`yarn` is used for development)
1. Optional [configuration](#environment-configuration)
1. Start web server `npm start`
1. View address in browser (printed in terminal on successful load)

## Environment configuration
1. Create a `.env` file in the project root
1. To enable Dropbox for hosting photos place Dropbox API v2 access token `HISTORY_DROPBOX_ACCESS_TOKEN=`

## Changelog of releases
See [CHANGELOG](CHANGELOG.md)

## Contributing to this open-source project
See [CONTRIBUTING](CONTRIBUTING.md)

## Copyright
See [LICENSE](LICENSE)
