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

	// avoid infinite loop
	if (req.body.user_name !== 'slackbot') {
		let parseBody = JSON.parse(req.body)

		let regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i
		let url = parseBody.text.match(regex)

		console.log(url)
		//bufferScraper("http://www.entrepreneur.com/article/253857")

		let botResponse = {
			text : "@" + parseBody.user_name + " Gracias por ocuparte de estos asuntos tan importantes."
		}

	    return res.status(200).json(botResponse)
	} else {
      return res.status(200).end()
	}
})

function bufferScraper (url) {
	let path = "https://buffer.com/ajax/scraper?url=" + url + "&skip_cache=false&need=10&min_width=80&min_height=80&strict=true"

	request(path, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	let parseBody = JSON.parse(body)

	  	let data = {
	  		text: parseBody.title + " " + url,
	  		media: {
	  			link: url,
	  			photo: parseBody.images[0].url
	  		}
	  	}

	  	addBuffer(data)
	  } else {
	  	console.log("Error: " + error)
	  }
	})
}

function addBuffer(data) {
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
}

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.message)
})

app.listen(port, function () {
  	console.log('Slack bot listening on port ' + port)
})