var mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    config = require('../../config'),
    User = require('../../models/user');


exports.authenticate = function(req, res) {
    User.findOne({email:req.body.email,password:req.body.password}, function(err,user) {
        if(user) {
            var token = jwt.sign(user, config.shared_secret, {expiresInMinutes:60*5});
            res.json({token:token,user:user});
        } else {
            res.sendStatus(400);
        }
    });
};

exports.register = function(req, res) {
    User.findOne({email:req.body.user.email}, function(err,user) {
        if(user) {
            res.json({status:400,err:'email'});
        } else {
            req.body.user.role = 'user';
            req.body.user.league = "547e50cdd52f9af3b36c67d8";
            var newUser = new User(req.body.user);
            newUser.save(function (err) {
                if (err) {
                    res.sendStatus(400);
                } else {
                    console.log(req.body.user.email + ' account created.');
                    res.sendStatus(200);
                }
            })
        }
    });
};