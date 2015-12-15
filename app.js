'use strict'

const express = require('express')
const bodyParser = require('body-parser')

let app = express()
let port = process.env.PORT || 3000

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// test route
app.get('/', function (req, res) { res.status(200).send('Hello world!') })
app.post('/share', function (req, res, next) {
  
	let botPayload = {
		text : 'Hello!'
	}

	console.log(req.body)

	return res.status(200).json(req.body);
})

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
})

app.listen(port, function () {
	console.log("Listening on http://localhost:" + port)
  	console.log('Slack bot listening on port ' + port)
})