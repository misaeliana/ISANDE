// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var LossesReasonsSchema = new mongoose.Schema({

	reason: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('LossesReasons', LossesReasonsSchema);