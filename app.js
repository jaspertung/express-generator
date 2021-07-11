var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require('passport');
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter')
const partnerRouter = require('./routes/partnerRouter')
const promotionRouter = require('./routes/promotionRouter')
const uploadRouter = require('./routes/uploadRouter')
const favoriteRouter = require('./routes/favoriteRouter')

const mongoose = require('mongoose');

const url = config.mongoUrl;
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

//redirect from http to https
app.all('*', (req, res, next) => {//.all and * catch all requests to any path on server
  if (req.secure) { //req.secure auto set to true if sent from https
    return next()
  } else {
    console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`)
    res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`) //301: permanent redirect, https server link
  }
}) 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware applied in the order they appear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); //arg: secret key --------replaced with Express sessions
//don't need authentication for ^

app.use(passport.initialize());
//moved to above auth function to allow clients to create new accounts and route logged out/unauthenticated users back to index
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter)
app.use('/partners', partnerRouter)
app.use('/promotions', promotionRouter)
app.use('/imageUpload', uploadRouter)
app.use('/favorites', favoriteRouter)

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
