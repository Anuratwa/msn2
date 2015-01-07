var mongoose = require ('mongoose');

module.exports = mongoose.model('Sport', {
    name : String,
    league: {type: mongoose.Schema.Types.ObjectId, ref: 'League'},
    divisions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Division'}]
});