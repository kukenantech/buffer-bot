'use strict'

const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')

let app = express()
let port = process.env.PORT || 3000

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// home route
app.get('/', function (req, res) { res.status(200).send('Hello world!') })

// POST request triggered from slack add-buffer
app.post('/add-buffer', function (req, res, next) {

	if (req.body.user_name !== 'slackbot') {

		let regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i
		let url = req.body.text.match(regex)
		url = url[0]

		let path = "https://buffer.com/ajax/scraper?url=" + url + "&skip_cache=false&need=10&min_width=80&min_height=80&strict=true"

		request(path, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	let parseBody = JSON.parse(body)

		  	console.log(parseBody)

		  	let data = {
		  		text: parseBody.title + " " + url,
		  		media: {
		  			link: url,
		  			photo: parseBody.images[0].url
		  		}
		  	}

		  	data.profile_ids = [ "566bb65af63980ee5a840357", "566bb682f63980ca5a840356", "566bb77917e384015a840354"]

		  	request({
		  	  uri: "https://api.bufferapp.com/1/updates/create.json?access_token=1/5a3f1179acb4ef897edfb22f9b86d4b0",
		  	  method: "POST",
		  	  form: data,
		  	}, function(error, response, body) {
		  		if(error) {
		  	  		console.log("Error: " + error)
		  		} else {
		  			console.log("Status Code: " + response.statusCode)
		  			console.log("Body:" + body)
		  		}
		  	})
		  } else {
		  	console.log("Error: " + error)
		  }
		})

		let botResponse = {
			text : "@" + req.body.user_name + " Gracias por ocuparte de estos asuntos tan importantes."
		}

	    return res.status(200).json(botResponse)
	} else {
      return res.status(200).end()
	}
})

function bufferScraper (url) {
	
}

function addBuffer(data) {
	
}

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.message)
})

app.listen(port, function () {
  	console.log('Slack bot listening on port ' + port)
})