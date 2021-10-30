// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var EmployeesSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},

	username: {
		type: String,
		required: true
	},

	password: {
		type: String,
		required: true
	},

	number: {
		type: Number,
		required: true
	},

	position: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Employees', EmployeesSchema);