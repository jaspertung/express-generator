var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const FileStore = require('session-file-store')(session) //2 params: require function returning another function as its return value and calling the return function with 2nd param (session)
const passport = require('passport');
const authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter')
const partnerRouter = require('./routes/partnerRouter')
const promotionRouter = require('./routes/promotionRouter')
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware applied in the order they appear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); //arg: secret key --------replaced with Express sessions
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false, //when new session created but no updates, then won't save because will be empty session (prevents empty session files and cookies)
  resave: false, //won't resave for new requests for the session since no updates (marks session as active so won't be deleted)
  store: new FileStore() //save in hard disk instead of application memory
}))
//don't need authentication for ^

app.use(passport.initialize());
app.use(passport.session());
//moved to above auth function to allow clients to create new accounts and route logged out/unauthenticated users back to index
app.use('/', indexRouter);
app.use('/users', usersRouter);

//so authentication starts here to serve static files-- creating custom middleware function named auth
function auth(req, res, next) { //all express middleware functions require req and res objects as params, next is optional
  //console.log(req.headers)
  console.log(req.user)
  //if (!req.signedCookies.user) { //signedCookies: auto parses cookie from request, if not properly signed then will return false -------replaced with Sessions
    //if no signedCookies.user or false, client hasn't been authenticated
  
  if (!req.user) {
    //const authHeader = req.headers.authorization
    //if (!authHeader) { //if null, then didn't get any authentication info (no username/pw) -----removed when added user router
    const err = new Error('You are not authenticated!')
    //res.setHeader('WWW-Authenticate', 'Basic') //lets client know that server is requesting auth and auth method being requested is Basic ------removed when added user router
    err.status = 401 //error code for when auth info not provided
    return next(err) //pass err message to express

    //sends error message back and requests clients credentials
    //if there is an auth header then decode username and pw info, then parse into array ['admin', 'password']
    // const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':') //Buffer: global in NodeJS (don't need to be required)
    // const user = auth[0]
    // const pass = auth[1]
    // //basic validation
    // if (user === 'admin' && pass === 'password') { //if true then pass to next middleware function
    //   //set up cookie
    //   //res.cookie('user', 'admin', {signed: true}) //creates new cookie passing in name of cookie (user), value of name property (admin), and optional object containing config values (let express know to use cookie parser to create signed cookie)  -------replaced with Sessions
    //   req.session.user = 'admin'
    //   return next() //authorized
    // } else {
    //   const err = new Error('You are not authenticated!')
    //   res.setHeader('WWW-Authenticate', 'Basic')
    //   err.status = 401
    //   return next(err)
    // } ------removed when added user router
  } else { //if there is a signed cookie
    //if (req.signedCookies.user === 'admin') { -------replaced with Sessions
    // if (req.session.user === 'authenticated') {
    //   return next()
    // } else {
    //   const err = new Error('You are not authenticated!')
    //   err.status = 401
    //   return next(err)
    // }
    return next()
  }
}
app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter)
app.use('/partners', partnerRouter)
app.use('/promotions', promotionRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
