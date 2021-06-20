var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
var mongoose = require('mongoose');

var User = mongoose.model('User');

router.use(function(req, res, next) {
  req.requestTime = Date.now();
  next();
}); 

router.use('/', function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}, function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Express', user: req.session.user });
});

/* GET login page. */ 
router.get('/login', function(req, res, next) { 
  res.render('pages/login', { title: 'Login Page', errors: null, user: req.session.user }); 
}); 

/* POST login. */
router.post('/login', 
[
  check('email')
    .isLength({ min: 1 })
    .withMessage('Please enter an email'),
  check('password')
    .isLength({ min: 1 })
    .withMessage('Please enter a pasword')
],
function(req, res, next) {
  var errors = validationResult(req);
  if(errors.isEmpty()) {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) next(err);
      if (!user) {
        return res.render('pages/login', { title: 'Login Page', errors: [new Error('user does not exist')], user: req.session.user });
      }
      console.log(req.body.password);
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) next(err);

        if (isMatch) {
          user.generateToken((err, user) => {
            if (err) return next(err);

            req.session.auth = user.token;
            req.session.user = user;
            res.redirect('/');
          });
          // req.session.user = user;
          // res.redirect('/')
        } else {
          res.render('pages/login', { title: 'Login Page', errors: [ new Error('Incorrect username or password')], user: req.session.user });
        }
      })
    })
  } else {
    res.render('pages/login', { title: 'Login Page', errors: errors.array(), user: req.session.user });
  }
});

/* GET Signup */ 
router.get('/signup', function(req, res) { 
  res.render('pages/signup', { title: 'Signup Page', errors: [], user: req.session.user }); 
}); 

/* POST Signup */
router.post('/signup', 
[
  check('firstName')
    .isLength({ min: 1 })
    .withMessage('Please enter a first name'),
  check('lastName')
    .isLength({ min: 1 })
    .withMessage('Please enter a last name'),
  check('username')
    .isLength({ min: 1 })
    .withMessage('Please enter a username'),
  check('email')
    .isLength({ min: 1 })
    .withMessage('Please enter an email'),
], (req, res, next) => {
  var errors = validationResult(req);
  if(errors.isEmpty()) {
    User.find()
    .then((user) => {
      var errors = [];
      if (user.username == req.body.username) {
        errors.push('Username already in use, try another');
      }
      if(user.email == req.body.email) {
        errors.push('Email is already in use, try another');
      }
      res.render('pages/signup', { title: 'Signup Page', errors: errors, user: req.session.user });
    })
    .catch((err) => {
      next(err);
    });;
    var newUser = new User({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    newUser.save((err, user) => {
      if (err) return next(err);

      user.generateToken((err, user) => {
        if (err) return next(err);

        req.session.auth = user.token;
        req.session.user = user;
        res.redirect('/');
      });
    });
    // newUser.save()
    //   .then(() => { 
    //     req.session.user = newUser;
    //     res.redirect('/'); 
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     next(err);
    //   });
  } else {
    res.render('pages/signup', { title: 'Signup Page', errors: errors.array(), user: req.session.user });
  }
    
});

/* POST logout */
router.get('/logout', function(req, res, next) {
  var user = new User(req.session.user);
  console.log(user);
  req.session.destroy((err) => {
    if (err) next(err);
  });
  user.deleteToken(user.token, (err, user) => {
    if (err) return next(err);
    res.redirect('/');
  })
});

/* GET Profile page. */ 
router.get('/profile',  function(req, res, next) {
  res.render('profile', { title: 'Profile Page', user : req.user,
  avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'retro'}, true) });
}); 



module.exports = router;
