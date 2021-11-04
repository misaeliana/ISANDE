// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var EmployeeStatusSchema = new mongoose.Schema({

	employeeStatus: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('EmployeeStatus', EmployeeStatusSchema);