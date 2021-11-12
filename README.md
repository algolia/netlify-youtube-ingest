# Netlify function to index YouTube videos on Algolia

This is a quick script to index (or just grab JSON) for youtube videos.

## Requirements

* [Algolia account](https://algolia.com/signup?utm_source=social&utm_medium=github&utm_campaign=devrel_youtube&utm_id=integrations) with an app ID
* [YouTube Developers API Key](https://developers.google.com/youtube/v3)

## Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/brob/netlify-youtube-ingest)


Use the "Deploy to Netlify" Button above. It will ask you for some environment variables:

* YouTube API key
* Algolia App ID
* Algolia Search API key
* Algolia Admin API key (for writing to the index)
* Algolia Index name (if the index doesn't exist, the function will create it)

After the first deploy, hit the `/.netlify/functions/getYoutubeJson` endpoint with a `channelId`, `maxResults`, and `index=true` query parameters (detailed below). This will index the most recent `n` videos for the channel provided (where `n` is the `maxResults` value).

Once indexed, the frontend for this microsite will work (or you can use the index elsewhere). 

### Set up indexing additional videos with IFTTT

To keep the index fresh, you'll want to create a way to index new content. In [IFTTT](https://ifttt.com), you can set up a "[New YouTube video by channel](https://ifttt.com/youtube/triggers/new_video_by_channel)" trigger that can fire a webhook action to the `/.netlify/functions/getYoutubeByUrl` function and provide the new video's URL as the `videoUrl` parameter with `index=true`. For every new video, your index will be updated.

### Details scraped

By default, these functions will scrape the following details:

* Title
* Description
* Tags
* Video Id (as objectID)
* Comment Count
* Likes
* Favorites
* Views

### Configuring your Algolia Index for better results

You can use all of this information as ranking and sorting inside your [Algolia dashboard](https://www.algolia.com/dashboard) and customize the search results. By default it will get strong matches around title, but you can configure it to search title, tags, and description (I recommend that order based on my own youtube channel usage).

You can also set up custom ranking based on number of likes, favorites, views, etc. for the most relevant search.
## Installation

In your Netlify project, create (or use) your Netlify functions directory. If you don't have one, create a new directory:

```sh
mkdir /netlify/functions
```

Put the contents of `netlify/functions/getYoutube.js` into this directory.

Install the dependencies:

```sh
npm install algoliasearch axios dotenv
```

To run locally, use [the Netlify Dev CLI](https://www.netlify.com/products/dev/).

```sh
netlify dev
```

### Environment variables

The function requires environment variables to connect to the YouTube API and an Algolia index.

|variable|use|
|--------|---|
|`YOUTUBE_KEY`| Your API Key for [the YouTube API](https://developers.google.com/youtube/v3)|
|`ALGOLIA_APP_ID`| The Algolia app ID |
|`ALGOLIA_API_KEY`| Your Algolia API key. This needs write permissions to write to the index |
|`ALGOLIA_SEARCH_KEY`| Your Algolia search-only key to power the frontend |
|`VIDEO_INDEX`| The Index name where your search index will be stored in Algolia |
 
## Usage

After installation, you'll have access to the following endpoints on your Netlify site:

`/.netlify/functions/getYoutubeJson`
`/.netlify/functions/getYoutubeByUrl`
## Parameters 

### `getYoutubeJson

```sh
/.netlify/functions/getYoutubeJson
        ?channelID=<your channel id>
        
        &maxResults=<number of results>
        
        &index=<true/false to index>
```

|parameter|type|what it does|
|---|----|---|
| `channelId` | `string` | The ID of the YouTube channel to scrape |
| `maxResults` | `string` | How many results to return (this is ordered by date, so it will get "latest" `n` videos) |
| `index` | `boolean` | if `true` will submit the videos in the list to Algolia (using env variables) if `false` will just display JSON in the body of the response

### `getYoutubeByUrl`

This endpoint is mostly intended to be used with an IFTTT Applet. IFTTT has a Trigger action that is for new YouTube video on a channel. When there's a new video, it can then fire a webhook to this endpoint and provide the URL for the video. The endpoint then gets the video ID from the video and indexes the video content and id.

|parameter|type|what it does|
|-------|----|------|
|`videoUrl` | `string` | The URL to the youtube video (this is the way to get it in IFTTT). This will be used to get the ID of the video|
| `index` | `boolean` | if `true` will submit the videos in the list to Algolia (using env variables) if `false` will just display JSON in the body of the response |
