const express = require('express')
const campsiteRouter = express.Router() // use campsiteRouter object to use with express routing methods

campsiteRouter.route('/') //path of just /, not campsites (in server.js)

//single statement that handles all the endpoints for routing to campsites
.all((req, res, next) => {//don't need path because already set in server.js
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    next()
}) 
.get((req, res) => { 
    res.end('Will send all the campsites to you')
})
.post((req, res) => {
    res.end(`Will add the campsites: ${req.body.name} with description: ${req.body.description}`)
})
.put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /campsites')
}) 
.delete((req, res) => {
    res.end('Deleting all campsites')
})

campsiteRouter.route('/:campsiteId')
//single chained statement that handles all route parameters for campsiteId
.all((req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    next()
}) 
.get((req, res) => { //store campsiteId value as route param named campsiteId
    res.end(`Will send details of the campsite: ${req.params.campsiteId} to you`)
}) 
.post((req, res) => { 
    res.statusCode = 403
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
}) 
.put((req, res) => { 
    res.write(`Updating the campsite: ${req.params.campsiteId}\n`)
    res.end(`Will update the campsite: ${req.body.name} 
        with description: ${req.body.description}`) //sent as JSON formatted response of request message, then echoing back in response as text
}) 
.delete((req, res) => {
    res.end(`Deleting campsite: ${req.params.campsiteId}`) //deleting specific campsite, not all of them
}) 

module.exports = campsiteRouter

