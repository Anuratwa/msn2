var mongoose = require('mongoose'),
    Division = require('../../models/division');


exports.getDivision = function(req, res) {
    console.log(JSON.stringify(req.params));
    console.log(JSON.stringify(req.body));
    Division.findOne({_id:req.params.id}, function(err,division) {
        if(division) {
            res.json(division);
        } else {
            res.sendStatus(400);
        }
    });
};

exports.getDivisions = function(req, res) {
    if(req.param('sport')) {
        Division.find({sport:req.param('sport')}, function(err,divisions){
            if(divisions) {
                res.json(divisions);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        Division.find({}, function(err,divisions) {
            if(divisions) {
                res.json(divisions);
            } else {
                res.sendStatus(400);
            }
        }).limit(50);
    }
};

exports.saveDivision = function(req, res) {
    var newDivision = new Division(req.body.division);
    newDivision.save(function(err, division) {
        if(err) {
            res.sendStatus(400);
        } else {
            console.log('New division ' + req.body.division.name + ' created');
            res.send(division);
        }

    });
};

exports.updateDivision = function(req, res) {
    Division.findOne({_id:req.params.id}, function(err,division) {
        if(err) {
            res.sendStatus(400);
        } else {
            for (var field in Division.schema.paths) {
                if((field !== '_id') && (field !== '__v')) {
                    if(req.body.division[field] !== undefined) {
                        division[field] = req.body.division[field];
                    }
                }
            }
            division.save();
            res.json(division);
        }
    });
};

exports.removeDivision = function(req, res) {
    console.log(req.body);
};