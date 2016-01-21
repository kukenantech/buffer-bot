'use strict'

const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const MetaInspector = require('node-metainspector')
const validator = require('validator')

let config = require('./config');

let app = express()
let port = process.env.PORT || 3000

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// home route
app.get('/', function (req, res) { res.status(200).send('Hello world! I\'m BufferBot') })

//POST request when /buffer command is used
app.post('/buffer', function (req, res, next) {
	
	let reqPayload = req.body

	/*let reqPayload = { 
		token: 'BG9XlDliMQUGfd9uypZG5yzZ',
		team_id: 'T04N7JNTU',
		team_domain: 'kukenan',
		channel_id: 'D04N7JP42',
		channel_name: 'directmessage',
		user_id: 'U04N7JNUS',
		user_name: 'juan',
		command: '/buffer',
		text: 'now lksjdajsdkaj #aksjdlkasd',
		response_url: 'https://hooks.slack.com/commands/T04N7JNTU/19012685108/cm5hKzkhnYjHY15SLaWQRqTZ'
	}*/
	console.log(req.reqPayload)

	//	Token validation
	if(reqPayload.token == config.COMMAND_TOKEN) {
		let botResponse = {
			//"response_type": "in_channel",
	    	"text": "",
		}

		let words = reqPayload.text.split(" ")

		switch(words.length) {
			case 1:
				//	Checking if contain help work or the link to share
				if(words[0].trim() == "help") {
					let readmeLink = {
						text: "Buffer Bot help you to share articles from Slack to your Buffer account.",
	            		title: "README",
            			title_link: "https://github.com/kukenantech/buffer-bot/blob/master/README.md",
	        		}

	        		botResponse.text = "For futher details see README in the Gthub repository."
					botResponse.attachments = [readmeLink]
				} else if(validator.isURL(words[0].trim())) {
					botResponse.text = "Add link to queue"
				} else {
					let readmeLink = {
						text: "Buffer Bot help you to share articles from Slack to your Buffer account.",
	            		title: "README",
            			title_link: "https://github.com/kukenantech/buffer-bot/blob/master/README.md",
	        		}
					botResponse.text = "Oops! Sorry, I can't understand your request. Please try again! For futher details see README in the Gthub repository"
					botResponse.attachments = [readmeLink]
				}

				break
			case 2:
				break
			case 3:
				break
			default:
				break
		}

		return res.status(200).json(botResponse)
	} else {
		return res.status(404).json({status: "404 Not Found"})
	}
})

// POST request triggered from slack add-buffer
app.post('/add-buffer', function (req, res, next) {

	if (req.body.user_name !== 'slackbot') {

		//	Getting URL from slack message
		let regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i
		let url = req.body.text.match(regex)

		if(url && url[0]) {
			//	Getting Title, Description, Images and Metatags
			let article = new MetaInspector(url[0], { timeout: 5000 })

			article.on("fetch", function() {

				//	Data payload for Twitter
				let twdata = {
			  		profile_ids: [config.TWITTER_PID],
			  		text: article.ogTitle + " " + url[0],
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
			  			console.log("Twitter updated created successfully!")
			  			console.log("Status Code: " + response.statusCode)
			  			//console.log("Body:" + body)
			  		}
			  	})

			  	//	Data payload for Facebook & LinkedIn
				let data = {
			  		profile_ids: [config.FACEBOOK_PID, config.LINKEDIN_PID],
			  		text: article.ogTitle + " " + url[0],
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
			  			console.log("Facebbok & LinkedId update created!")
			  			console.log("Status Code: " + response.statusCode)
			  			//console.log("Body:" + body)
			  		}
			  	})
			})

			article.on("error", function(err){
			    console.log(error);
			})

			article.fetch()

			let botResponse = {
				text : "@" + req.body.user_name + " Gracias por ocuparte de estos asuntos tan importantes."
			}

		    return res.status(200).json(botResponse)
		} else {
			return res.status(200).json({text: "@" + req.body.user_name + " No detecté ningún URL para compartir :-1:. Inténtalo de nuevo!"})
		}
	} else {
      return res.status(200).end()
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