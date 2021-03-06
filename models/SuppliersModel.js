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

	number2: {
		type:String,
		required: false
	},

	email: {
		type: String,
		required: false
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