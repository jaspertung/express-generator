//file was auto created by express
const express = require('express');
const User = require('../models/user')
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//allow new users to sign up
router.post('/signup', (req, res) => {
  User.register(
      new User({username: req.body.username}),
      req.body.password,
      err => {
          if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
          } else {
              passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'Registration Successful!'});
              });
          }
      }
  );
});

//check if user is already logged in (already tracking authenticated session)
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});

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
