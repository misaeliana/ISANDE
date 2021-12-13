// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var SuppliersSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},

	contactPerson: {
		type: String,
		required: true
	},

	number: {
		type: String,
		required: true
	},

	email: {
		type: String,
		required: true
	},

	address: {
		type: String,
		required: true
	},
	
	informationStatusID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Suppliers', SuppliersSchema);