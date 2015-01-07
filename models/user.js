var mongoose = require ('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
    first : String,
    last : String,
    mcgill_id : Number,
    email: String,
    phone: Number,
    password: String,
    role : String,
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    sports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
    divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Division' }],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    captain_for: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}));