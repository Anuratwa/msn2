var mongoose = require('mongoose'),
    User = require('../../models/user');


exports.getUser = function(req, res) {
    if(req.param('populate')) {
        User.findOne({_id:req.params.id}).populate('games teams').exec(function(err,user) {
            if(user) {
                res.json(user);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        User.findOne({_id:req.params.id}, function(err,user) {
            if(user) {
                res.json(user);
            } else {
                res.sendStatus(400);
            }
        });
    }
};

exports.getUsers = function(req, res) {
    if(req.param('email')) {
        User.findOne({email:req.param('email')}, function(err,user) {
            if(user) {
                res.json(user);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        User.find({}, function(err,users) {
            if(users) {
                res.json(users);
            } else {
                res.sendStatus(400);
            }
        }).limit(50);
    }
};

exports.saveUser = function(req, res) {
    //unneccessary - handled in login route registerUser
};

exports.updateUser = function(req, res) {
    User.findOne({_id:req.params.id}, function(err,user) {
        if(err) {
            res.sendStatus(400);
        } else {
            for (var field in User.schema.paths) {
                if((field !== '_id') && (field !== '__v')) {
                    if(req.body.user[field] !== undefined) {
                        user[field] = req.body.user[field];
                    }
                }
            }
            user.save();
            res.json(user);
        }
    });
};

exports.removeUser = function(req, res) {
    console.log(req.body);
};