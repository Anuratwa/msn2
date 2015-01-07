var mongoose = require ('mongoose');

module.exports = mongoose.model('Team', {
    name: String,
    start_month: Number,
    start_year: Number,
    end_month: Number,
    end_year: Number,
    wins: Number,
    losses: Number,
    draws: Number,
    captain: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    division: {type: mongoose.Schema.Types.ObjectId, ref: 'Division'},
    sport: {type: mongoose.Schema.Types.ObjectId, ref: 'Sport'},
    league: {type: mongoose.Schema.Types.ObjectId, ref: 'League'},
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}]
});