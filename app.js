var express = require('express');
var routes = require('./routes');
var login = require('./routes/login');
var user = require('./routes/user');
var league = require('./routes/league');
var sport = require('./routes/sport');
var division = require('./routes/division');
var team = require('./routes/team');
var game = require('./routes/game');
var config = require('./config');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var multer = require('multer');
var expressJwt = require('express-jwt');
var errorHandler = require('errorhandler');

var app = express();

app.set('port', process.env.PORT || 3030);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use('/api', expressJwt({secret: config.shared_secret}));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(config.mongo_uri);

var League = require('./models/league');
var Sport = require('./models/sport');
var Division = require('./models/division');
var Team = require('./models/team');
var User = require('./models/user');
var Game = require('./models/game');

app.get('/', routes.login);
app.get('/register', routes.login);
app.get('/portal', routes.portal);
app.get('/profile', routes.portal);
app.get('/admin', routes.portal);
app.get('/manage', routes.portal);
app.get('/league', routes.portal);
app.get('/partials/:handler?/:resource?', routes.partials);

app.post('/authenticate', login.authenticate);
app.post('/register', login.register);

app.get('/api/user/:id', user.getUser);
app.get('/api/user', user.getUsers);
app.post('/api/user', user.saveUser);
app.put('/api/user/:id', user.updateUser);
app.delete('/api/user/:id', user.removeUser);

app.get('/api/league/:id', league.getLeague);
app.get('/api/league', league.getLeagues);
app.post('/api/league', league.saveLeague);
app.put('/api/league/:id', league.updateLeague);
app.delete('/api/league/:id', league.removeLeague);

app.get('/api/sport/:id', sport.getSport);
app.get('/api/sport', sport.getSports);
app.post('/api/sport', sport.saveSport);
app.put('/api/sport/:id', sport.updateSport);
app.delete('/api/sport/:id', sport.removeSport);

app.get('/api/division/:id', division.getDivision);
app.get('/api/division', division.getDivisions);
app.post('/api/division', division.saveDivision);
app.put('/api/division/:id', division.updateDivision);
app.delete('/api/division/:id', division.removeDivision);

app.get('/api/team/:id', team.getTeam);
app.get('/api/team', team.getTeams);
app.post('/api/team', team.saveTeam);
app.put('/api/team/:id', team.updateTeam);
app.delete('/api/team/:id', team.removeTeam);

app.get('/api/game/:id', game.getGame);
app.get('/api/game', game.getGames);
app.post('/api/game', game.saveGame);
app.put('/api/game/:id', game.updateGame);
app.delete('/api/game/:id', game.removeGame);

app.all('*', function(req, res) {
    res.redirect("/portal");
});

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});