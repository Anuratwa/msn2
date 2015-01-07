var mongoose = require ('mongoose');

module.exports = mongoose.model('Game', {
    home : {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
    home_name : String,
    away: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
    away_name : String,
    home_score: Number,
    away_score: Number,
    location: String,
    date: String,
    time: String,
    complete: Boolean
});