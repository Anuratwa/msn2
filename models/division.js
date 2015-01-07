var mongoose = require ('mongoose');

module.exports = mongoose.model('Division', {
    name : String,
    start_month: Number,
    start_year: Number,
    end_month: Number,
    end_year: Number,
    league: {type: mongoose.Schema.Types.ObjectId, ref: 'League'},
    sport : {type: mongoose.Schema.Types.ObjectId, ref: 'Sport'},
    sport_desc: String,
    teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
    games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}]
});