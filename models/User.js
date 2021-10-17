var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 26
    },
    last_name: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 26
    },
    username: {
        type: String,
        trim: true,
        required: true,
        index: { unique: true},
        minlength: 3,
        maxlength: 26
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    token: {
        type: String
    }
});

userSchema.pre('save', function(next) {
    var user = this;

    //only hash password if it has been modified/is new
    if(!user.isModified('password')) return next();

    //generate salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        //hash the password along with new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            //override cleartext password w/ hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.generateToken = function(cb) {
    user = this;
    var token = jwt.sign(user._id.toHexString(), process.env.TOKENSECRET);
    
    user.token = token;
    user.save(function(err, user) {
        if (err) return cb(err);
        cb(null, user);
    });
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    jwt.verify(token, process.env.TOKENSECRET, function(err, decode) {
        user.findOne({"_id": decode, "token": token}, function(err, user) {
            if (err) return cb(err);
            cb(null, user);
        });
    });
}

userSchema.methods.deleteToken = function(token, cb) {
    var user = this;

    user.update({$unset: {token: 1}}, function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
}

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

module.exports = mongoose.model('User', userSchema);