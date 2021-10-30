// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var LossesSchema = new mongoose.Schema({

	itemID: {
		type: String,
		required: true
	},

	quantity: {
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

module.exports = mongoose.model('Losses', LossesSchema);