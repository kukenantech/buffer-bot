# Buffer Bot

Buffer Bot help you to share articles from Slack to your Buffer account.

## Usage

`/buffer ["now"] [url] [hashtags]`

Just type `/buffer` and Buffer Bot will do the rest. If you need help type `/buffer help`

### Parameters

- **Now** (Optional): If the word `now` is provided the link will be shared immediately in profiles of the Buffer Account, if not, link will be added to the queue.

- **URL** (Required): The link that will be shared. Buffer Bot will get Title, Description and Image from this parameter.

- **Hashtags** (Optional): Multiple hashtags are supported, each of them must contain the hash (`#`) symbol.

### Examples

#### Add a link in Buffer Queue

`/buffer http://link-to-share.com`

#### Share a link immediately in your Buffer Profiles

`/buffer now http://link-to-share.com`

#### Add a link in Buffer Queue with hashtags

`/buffer http://link-to-share.com #slack,#bufferbot`

#### Share a link immediately in your Buffer Profiles with hashtags

`/buffer now http://link-to-share.com #slack,#bufferbot`


## Setup and Installation

### Setup Heroku Server

```bash
$ heroku init
$ git push heroku master
$ heroku config:set ACCESS_TOKEN=[ACCESS TOKEN FROM BUFFER APPLICATION]
$ heroku config:set TWITTER_PID=[TWITTER PROFILE ID]
$ heroku config:set FACEBOOK_PID=[FACEBOOK PROFILE ID]
$ heroku config:set LINKEDIN_PID=[LINKEDIN PROFILE ID]
```

### Setup Slash Command

1. Read Slack API Docs to understand how Slash Commands works [https://api.slack.com/slash-commands]()
2. Create a Slash Command in Slack Settings and set the following data:
    - Command: `/buffer`
    - URL: `https://[URL_GENERATED].herokuapp.com/buffer`
    - Method: `POST`
    - Customize Name: `Buffer Bot`
    - Autocomplete help text
        - Description: `Share articles from Slack to your Buffer account.`
        - Autocomplete help text - Usage hint: `["now"] [url] [hashtags]`

All other settings can be set on your own discretion.

## Contribute

If you want to add any new features, or improve existing ones, feel free to send a pull request.