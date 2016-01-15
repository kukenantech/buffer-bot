'use strict'

const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const MetaInspector = require('node-metainspector')

let config = require('./config');

let app = express()
let port = process.env.PORT || 3000

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// home route
app.get('/', function (req, res) { res.status(200).send('Hello world!') })

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

				//	Data payload
				let data = {
			  		profile_ids: [ config.TWITTER_PID, config.FACEBOOK_PID, config.LINKEDIN_PID],
			  		text: article.ogTitle + " " + url[0],
			  		media: {
			  			link: url[0],
			  			title: article.ogTitle,
			  			description: article.ogDescription,
			  			//photo: article.image,
			  			picture: article.image
			  		}
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
			  			console.log("Success!")
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
  	console.log('Slack bot listening on port ' + port)
})