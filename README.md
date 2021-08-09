# history

Your personal **history** storyboarded with photo and video albums. Associate photos with their meta data including geocode, caption... in XML albums.
* Enhanced privacy as photos are stored locally not in the cloud
* Plot thumbnails on a map
* Includes administration tools for XML generation

[Demonstration site https://history.domaindesign.ca/](https://history.domaindesign.ca/)
## Project Status:
| Service | Status |
|---|---|
| CI | [![Build Status](https://api.travis-ci.com/danactive/history.png?branch=master)](https://travis-ci.com/danactive/history) |
| Dependencies | [![Dependencies Status](https://david-dm.org/danactive/history.svg)](https://david-dm.org/danactive/history) [![DevDependencies Status](https://david-dm.org/danactive/history/dev-status.svg)](https://david-dm.org/danactive/history#info=devDependencies) |
| Security | [![Known Vulnerabilities](https://snyk.io/test/github/danactive/history/badge.svg)](https://app.snyk.io/org/danactive/project/ca45a886-fc61-402f-9cd1-69bf22b35f24) |
| Test Coverage | [![Coverage Status](https://coveralls.io/repos/github/danactive/history/badge.svg?branch=master)](https://coveralls.io/github/danactive/history?branch=master) |
| License | [![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT) |

## Installation

### View (Read-only)
1. `docker-compose up` Build and start history app (both frontend and backend)
1.  View frontend at http://localhost:3000

### Development
1. Node.js v14 LTS [Download](https://nodejs.org/)
1. Folder **app** both the backend and frontend using Next.js
1. Install project dependencies `npm ci`
1. Start web server `npm run dev`
1. View address in browser (printed in terminal on successful load)

### Legacy Development
1. Node.js v12 LTS [Download](https://nodejs.org/)
1. Folder **api** is the backend; **ui** is the frontend
1. Install project dependencies `npm ci`
1. Optional [configuration](#environment-configuration)
1. Start web server `npm start`
1. View address in browser (printed in terminal on successful load)

#### Environment configuration
1. Create a `.env` file in the project root
1. To enable Dropbox for hosting photos place Dropbox API v2 access token `HISTORY_DROPBOX_ACCESS_TOKEN=`

## Changelog of releases
See [CHANGELOG](app/CHANGELOG.md)

## Contributing to this open-source project
See [CONTRIBUTING](api/CONTRIBUTING.md)

## Copyright
See [LICENSE](LICENSE)

## Visualization
![Visualization of the codebase](./diagram.svg)
