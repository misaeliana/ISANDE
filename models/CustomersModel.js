// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var CustomersSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},

	number: {
		type: String,
		required: false
	},

	address: {
		type: String,
		required: false
	},

	informationStatusID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Customers', CustomersSchema);