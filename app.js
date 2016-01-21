'use strict'

const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const MetaInspector = require('node-metainspector')
const validator = require('validator')

let config = require('./config');

let app = express()
let port = process.env.PORT || 3000

function createUpdate (url, sharedNow, hashtags, response_url) {
	//	Getting Title, Description, Images and Metatags
	let article = new MetaInspector(url, { timeout: 5000 })

	article.on("fetch", function() {

		//	Data payload for Twitter
		let twdata = {
	  		profile_ids: [config.TWITTER_PID],
	  		text: article.ogTitle + " " + url + " " + hashtags,
	  		now: sharedNow,
	  		media: {
	  			photo: article.image,
	  			thumbnail: article.image
	  		}
	  	}
	  	
	  	// API request to Buffer API
	  	request({
	  	  uri: config.API_ENDPOINT + "/updates/create.json?access_token=" + config.ACCESS_TOKEN,
	  	  method: "POST",
	  	  form: twdata,
	  	}, function(error, response, body) {
	  		if(error) {
	  	  		console.log("Error: " + error)
	  		} else {
	  			console.log("Twitter updated created!")
	  			console.log("Status Code: " + response.statusCode)
	  			//console.log("Body:" + body)

	  			//	POST request to create delayed response as attachment
	  			let linkAttached = {
	  				attachments: [
	  					{
	  						title: article.ogTitle + " " + hashtags,
	  						title_link: url,
	  						text: article.description,
	  						image_url: article.image,
	  						thumb_url: article.image,
	  						author_name: article.author
	  					}
	  				]
	  			}

	  			request({
	  				uri: response_url,
	  				method: "POST",
	  				json: linkAttached
	  			}, function (error, response, body) {
	  				if(error) {
	  					console.log("Error:" + error)
	  				} else {
	  					console.log("Article attached in Slack Response!")
	  				}
	  			})
			}
	  	})

	  	//	Data payload for Facebook & LinkedIn
		let data = {
	  		profile_ids: [config.FACEBOOK_PID, config.LINKEDIN_PID],
	  		text: article.ogTitle + " " + url + " " + hashtags,
	  		now: sharedNow
	  	}
	  	
	  	// API request to Buffer API
	  	request({
	  	  uri: config.API_ENDPOINT + "/updates/create.json?access_token=" + config.ACCESS_TOKEN,
	  	  method: "POST",
	  	  form: data,
	  	}, function(error, response, body) {
	  		if(error) {
	  	  		console.log("Error: " + error)
	  		} else {
	  			console.log("Facebook & LinkedId update created!")
	  			console.log("Status Code: " + response.statusCode)
	  			//console.log("Body:" + body)
	  		}
	  	})
	})

	article.on("error", function(err){
	    console.log(error);
	})

	article.fetch()
}

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// home route
app.get('/', function (req, res) { res.status(200).send('Hello world! I\'m BufferBot') })

//POST request when /buffer command is used
app.post('/buffer', function (req, res, next) {
	
	let reqPayload = req.body

	//	Token validation
	if(reqPayload.token == config.COMMAND_TOKEN) {
		let botResponse = {
			response_type: "in_channel",
			text: "@channel: Hey Team, take a look at this article that @" + reqPayload.user_name + " just shared on Buffer."
		}
		let readmeLink = {
	            		title: "README",
            			title_link: "https://github.com/kukenantech/buffer-bot/blob/master/README.md",
            			text: "Buffer Bot help you to share articles from Slack to your Buffer account."
	        		}
	    let errorMsg = "Oops! Sorry, I can't understand your request. Please try again! For futher details see README in the Github repository."

		let words = reqPayload.text.trim().split(" ")

		switch(words.length) {
			case 1:
				//	Checking if contain the link to share or help word
				if(validator.isURL(words[0].trim())) {
					let url = words[0].trim()
					createUpdate(url, false, '', reqPayload.response_url)
				} else {
	        		botResponse.text = "For futher details see README in the Github repository."
	        		botResponse.attachments = [readmeLink]
				}
				break

			default:
				//	Checking format "now http://urltosahre.com" or "http://urltosahre.com #slack #buffer"
				if(words[0].trim().toLowerCase() == "now" && validator.isURL(words[1].trim())) {

					let url = words[1].trim()
					let hashtags = reqPayload.text.match(/#\w+/gi)
					createUpdate(url, true, (hashtags) ? hashtags.join(' ') : '', reqPayload.response_url)

				} else if(validator.isURL(words[0].trim())) {

					let url = words[0].trim()
					let hashtags = reqPayload.text.match(/#\w+/gi)
					createUpdate(url, false, (hashtags) ? hashtags.join(' ') : '', reqPayload.response_url)

				} else {
	        		botResponse.text = errorMsg
	        		botResponse.attachments = [readmeLink]
				}
				break
		}

		return res.status(200).json(botResponse)
	} else {
		return res.status(404).json({status: "404 Not Found"})
	}
})

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.message)
})

app.listen(port, function () {
  	console.log('Buffer Bot listening on port ' + port)
})