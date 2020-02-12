# history-app
Photo gallery presentation layer (frontend). See [history-api for the backend including APIs](../api)

## Environment configuration
1. Create a `.env` file in the project root (not the `/ui` folder but `/`)
1. The app needs a Dropbox environment variable (may or may not have a value) for hosting photos place Dropbox API v2 access token `HISTORY_DROPBOX_ACCESS_TOKEN=`
1. The app needs a YouTube Search API environment variable (must have a value for the video player to load) `HISTORY_YOUTUBE_API_KEY=`

## Dropbox folder structure
* `public`
	* `gallery-demo` duplicated from this project
	* `gallery-*` a collection of photography (e.g. gallery-mom, gallery-2017)
