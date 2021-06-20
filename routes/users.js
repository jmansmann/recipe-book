var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
var mongoose = require('mongoose');

var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find()
  .then((users) => {
    res.locals.users = users;
    next();
  })
  .catch((users) => {
    next(err);
  });
});

router.get('/', function(req, res, next) {
  var users = res.locals.users;
  var message = null;
  console.log(req.cookies['isSuccess']);
  console.log(req.session.user);
  if (req.cookies['isSuccess'] == 'true') {
    message = "Success!";
    res.clearCookie('isSuccess');
  }
  res.render('users/users', {users: users, message: message, user: req.session.user});
});

/* GET add user. */
router.get('/addUser', function(req, res, next) {
  res.render('users/addUser', {errors: null});
});

/* POST add user. */
router.post('/addUser', 
[
  check('username')
    .isLength({ min: 1 })
    .withMessage('Please enter a name'),
  check('email')
    .isLength({ min: 1 })
    .withMessage('Please enter an email'),
  check('password')
    .isLength({ min: 3 })
    .withMessage('Please enter a password')
], (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if(errors.isEmpty()) {
    var user = new User(req.body);
    user.save()
      .then(() => { 
        res.cookie('isSuccess', 'true');
        res.redirect('/users'); 
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  } else {
    res.render('users/addUser', {
      errors: errors.array(),
      data: req.body
    });
  }
});

/* GET edit user. */
router.get('/:id/edit', function(req, res, next) {
  var id = req.params.id;
  User.findById(id, function(error, results) {
    if(error) next(error);
    if(results.username == null) {
      var err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    res.render('users/editUser', { user: results, errors: {} });
  });
});

/* POST edit user. */
router.post('/:id/edit',
[
  check('username')
    .isLength({ min: 1 })
    .withMessage('Please enter a valid name'),
  check('email')
    .isLength({ min: 1 })
    .withMessage('Please enter a valid email'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    var id = req.params.id;
    User.findByIdAndUpdate(id, req.body, (error, response) => {
      if (error) next(error);
      res.cookie('isSuccess', 'true');
      res.redirect('/users');
    });
  } else {
    res.render('users/editUser' , {
      errors: errors.array(),
      data: req.body
    });
  }
} );

/* GET details user. */
router.get('/:id/details', (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if(err) next(err);
    if(user.username == null){
      var err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    res.render('users/detailsUser', { user, errors: {} });
  });
});

/* GET delete user. */
router.get('/:id/delete', (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if(err) next(err);
    if(user.username == null){
      var err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    res.render('users/deleteUser', { user, errors: {} });
  });
});

/* POST delete user. */
router.post('/:id/delete', (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    var id = req.params.id;
    User.findByIdAndDelete(id, req.body, (error, response) => {
      if (error) next(error);
      res.redirect('/users');
    });
  } else {
    res.render('users/editUser' , {
      errors: errors.array(),
      data: req.body
    });
  }
} );

module.exports = router;
