//file was auto created by express
const express = require('express');
const User = require('../models/user')

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//allow new users to sign up
router.post('/signup', (req, res, next) => { 
  //make sure username doesn't already exist
  User.findOne({username: req.body.username})
  .then(user => { //user is promise value that will either contain document with matching username or null if no matching documents
    if (user) { //user document found with matching name
      const err = new Error(`User ${req.body.username} already exists!`)
      err.status = 403
      return next(err)
    } else { //null, undefined, or anything other than a document
      User.create( {
        username: req.body.username,
        password: req.body.password
      })
      .then (user => { //returns promise value of document added
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json({status: 'Registration Successful!', user: user}) //user: user- representation of user document
      })
      .catch(err => next(err))
    }
  })
  .catch(err => next(err))
})

//check if user is already logged in (already tracking authenticated session)
router.post('/login', (req, res, next) => {
  if (!req.session.user) { //there is no session so need to handle login
    const authHeader = req.headers.authorization
    if (!authHeader) {
      const err = new Error('You are not authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':') 
    const username = auth[0]
    const password = auth[1]
    //check username and password sent in and check against values in database
    User.findOne({username: username})
    .then(user => {
      if (!user) {
        const err = new Error(`User ${username} does not exist!`)
        err.status = 401
        return next(err)
      } else if (user.password !== password) {
        const err = new Error('Your password is incorrect!')
        err.status = 401
        return next(err)
      } else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated'
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('You are authenticated!')
      }
    })
    .catch(err => next(err))
  } else { //there is a session
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('You are already authenticated!')
  }
})

//log out the user (user GET because client is sending info to server)
router.get('/logout', (req, res, next) => {
  if (req.session) { //if session exists, then destroy it
    req.session.destroy() //deleting file on server side
    res.clearCookie('session-id') //clear the cookie stored in the client
    res.redirect('/') //redirect user to root path
  } else { //no session (client requesting to log out without being logged in)
    const err = new Error('You are not logged in!')
    err.status = 401
    return next(err)
  }
})


module.exports = router;
