var mongoose = require ('mongoose');

module.exports = mongoose.model('League', {
    name : String,
    sports: [{type: mongoose.Schema.Types.ObjectId, ref: 'Sport'}],
    divisions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Division'}],
    teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}]
});