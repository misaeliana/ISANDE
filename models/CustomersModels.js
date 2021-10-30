// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var CustomersSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},

	number: {
		type: Number,
		required: false
	},

	address: {
		type: String,
		required: false
	},

	notes: {
		type: String,
		required: false
	},

	statusID: {
		type: Number,
		required: false
	}
});

module.exports = mongoose.model('Customers', CustomersSchema);