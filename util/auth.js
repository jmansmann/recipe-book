const User = require("./../models/User");

let auth = function(req, res, next) {
    let token = req.session.auth;
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if(!user) return res.json({error: true});

        req.session.token = token;
        req.session.user = user;
        next();
    });
}
module.exports.auth = auth;
module.exports.isUser = function(req, res, next) {
    if(req.session.user) {
        next();
    } else {
        var err = new Error('not logged in');
        console.log(req.session.user);
        next(err);
    }
}