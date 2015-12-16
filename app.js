'use strict'

const express = require('express')
const bodyParser = require('body-parser')

let app = express()
let port = process.env.PORT || 3000

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// home route
app.get('/', function (req, res) { res.status(200).send('Hello world!') })

// POST request triggered from slack add-buffer
app.post('/add-buffer', function (req, res, next) {
  
	let botPayload = {
		text : 'Hello!'
	}

	console.log(req.body)

	// avoid infinite loop
	if (req.body.user_name !== 'slackbot') {
	    return res.status(200).json({ "text": "@" + req.body.username + "Gracias por ocuparte de esots asuntos tan importantes" })
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
	console.log("Listening on http://localhost:" + port)
  	console.log('Slack bot listening on port ' + port)
})