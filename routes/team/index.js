var mongoose = require('mongoose'),
    Team = require('../../models/team'),
    Game = require('../../models/game');


exports.getTeam = function(req, res) {
    console.log(JSON.stringify(req.params));
    console.log(JSON.stringify(req.body));
    Team.findOne({_id:req.params.id}, function(err,team) {
        if(team) {
            res.json(team);
        } else {
            res.sendStatus(400);
        }
    });
};

exports.getTeams = function(req, res) {
    if(req.param('teams')) {
        Team.find({_id:{$in:req.param('teams').split(',')}}).populate('games users sport division').exec(function(err,teams){
            if(teams) {
                res.json(teams);
            } else {
                res.sendStatus(400);
            }
        });
    } else if(req.param('division')) {
        Team.find({division:req.param('division')}, function(err,teams){
            if(teams) {
                res.json(teams);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        Team.find({}, function(err,teams) {
            if(teams) {
                res.json(teams);
            } else {
                res.sendStatus(400);
            }
        }).limit(50);
    }
};

exports.saveTeam = function(req, res) {
    var newTeam = new Team(req.body.team);
    newTeam.save(function(err, team) {
        if(err) {
            res.sendStatus(400);
        } else {
            console.log('New team ' + req.body.team.name + ' created');
            res.send(team);
        }

    });
};

exports.updateTeam = function(req, res) {
    Team.findOne({_id:req.params.id}, function(err,team) {
        if(err) {
            res.sendStatus(400);
        } else {
            for (var field in Team.schema.paths) {
                if((field !== '_id') && (field !== '__v')) {
                    if(req.body.team[field] !== undefined) {
                        team[field] = req.body.team[field];
                    }
                }
            }
            team.save();
            res.json(team);
        }
    });
};

exports.removeTeam = function(req, res) {
    console.log(req.body);
};