var mongoose = require('mongoose'),
    Sport = require('../../models/sport');


exports.getSport = function(req, res) {
    console.log(JSON.stringify(req.params));
    console.log(JSON.stringify(req.body));
    Sport.findOne({_id:req.params.id}, function(err,sport) {
        if(sport) {
            res.json(sport);
        } else {
            res.sendStatus(400);
        }
    });
};

exports.getSports = function(req, res) {
    if(req.param('league')) {
        Sport.find({league:req.param('league')}, function(err,sports){
            if(sports) {
                res.json(sports);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        Sport.find({}, function(err,sports) {
            if(sports) {
                res.json(sports);
            } else {
                res.sendStatus(400);
            }
        }).limit(50);
    }
};

exports.saveSport = function(req, res) {
    var newSport = new Sport(req.body.sport);
    newSport.save(function(err, sport) {
        if(err) {
            res.sendStatus(400);
        } else {
            console.log('New sport ' + req.body.sport.name + ' created');
            res.send(sport);
        }

    });
};

exports.updateSport = function(req, res) {
    Sport.findOne({_id:req.params.id}, function(err,sport) {
        if(err) {
            res.sendStatus(400);
        } else {
            for (var field in Sport.schema.paths) {
                if((field !== '_id') && (field !== '__v')) {
                    if(req.body.sport[field] !== undefined) {
                        sport[field] = req.body.sport[field];
                    }
                }
            }
            sport.save();
            res.json(sport);
        }
    });
};

exports.removeSport = function(req, res) {
    console.log(req.body);
};