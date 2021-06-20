var createError = require('http-errors');
var express = require('express');
var path = require('path');
var auth = require('http-auth');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var auth = require('./util/auth');
require('dotenv').config();

// const basic = auth.basic({
//   file: path.join(__dirname, './users.htpasswd'),
// });

//database connection

require('./models/User');

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection
  .on('open', () => {
    console.log('Mongoose connection open');
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var toothRouter = require('./routes/tooth');
var aboutRouter = require('./routes/about');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

app.use(bodyParser.urlencoded({extended: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'a secret key'}));


app.use('/', indexRouter);
app.use('/users', auth.auth,  usersRouter);
app.use('/tooth', toothRouter);
app.use('/about', aboutRouter);


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
  res.render('error', {user: req.session.user});
});

module.exports = app;

//app.set('port', process.env.PORT || 3000); 
var server = app.listen(app.get('port'), function() { 
  console.log('database: ' + process.env.DATABASE);
  console.log('Express server listening on port ' + server.address().port); 
}); 

