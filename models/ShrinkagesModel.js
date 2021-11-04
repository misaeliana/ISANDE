// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ShrinkagesSchema = new mongoose.Schema({

	itemID: {
		type: String,
		required: true
	},

	systemCount: {
		type: Number,
		required: true
	},

	manualCount: {
		type: Number,
		required: true
	},

	reasonID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
		required: true
	},

	employeeID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Shrinkages', ShrinkagesSchema);