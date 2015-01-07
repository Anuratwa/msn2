var mongoose = require('mongoose'),
    Game = require('../../models/game');

exports.getGame = function(req, res) {
    console.log(JSON.stringify(req.params));
    console.log(JSON.stringify(req.body));
    Game.findOne({_id:req.params.id}, function(err,game) {
        if(game) {
            res.json(game);
        } else {
            res.sendStatus(400);
        }
    });
};

exports.getGames = function(req, res) {
    if(req.param('user')) {
        Game.find({user:req.param('user')}, function(err,games) {
            if(games) {
                res.json(games);
            } else {
                res.sendStatus(400);
            }
        });
    } else if(req.param('home') && req.param('away')) {
        Game.find({home:req.param('home'),away:req.param('away')}, function(err,games){
            if(games) {
                res.json(games);
            } else {
                res.sendStatus(400);
            }
        });
    } else {
        Game.find({}, function(err,games) {
            if(games) {
                res.json(games);
            } else {
                res.sendStatus(400);
            }
        }).limit(50);
    }
};

exports.saveGame = function(req, res) {
    var newGame = new Game(req.body.game);
    newGame.save(function(err, game) {
        if(err) {
            res.sendStatus(400);
        } else {
            res.send(game);
        }

    });
};

exports.updateGame = function(req, res) {
    Game.findOne({_id:req.params.id}, function(err,game) {
        if(err) {
            res.sendStatus(400);
        } else {
            game.home_score = req.body.home_score;
            game.away_score = req.body.away_score;
            game.complete = req.body.complete;
            game.save();
            res.json(game);
        }
    });
};

exports.removeGame = function(req, res) {
    console.log(req.body);
};