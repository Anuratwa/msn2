var mongoose = require('mongoose'),
    League = require('../../models/league');


exports.getLeague = function(req, res) {
    if(req.param('populate')) {
        League.findOne({_id:req.params.id}).populate('sports divisions teams').exec(function(err,league) {
            if(league) {
                res.json(league);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        League.findOne({_id:req.params.id}, function(err,league) {
            if(league) {
                res.json(league);
            } else {
                res.sendStatus(400);
            }
        });
    }
};

exports.getLeagues = function(req, res) {
    //unneccessary
};

exports.saveLeague = function(req, res) {
    //unneccessary - handled in login route registerUser
};

exports.updateLeague = function(req, res) {
    League.findOne({_id:req.params.id}, function(err,league) {
        if(err) {
            res.sendStatus(400);
        } else {
            for (var field in League.schema.paths) {
                if((field !== '_id') && (field !== '__v')) {
                    if(req.body.league[field] !== undefined) {
                        league[field] = req.body.league[field];
                    }
                }
            }
            league.save();
            res.json(league);
        }
    });
};

exports.removeLeague = function(req, res) {
    console.log(req.body);
};