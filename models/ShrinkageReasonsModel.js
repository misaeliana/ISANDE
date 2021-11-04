// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ShrinkageReasonsSchema = new mongoose.Schema({

	reason: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('ShrinkageReasons', ShrinkageReasonsSchema);