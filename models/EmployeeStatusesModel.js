// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var EmployeeStatusesSchema = new mongoose.Schema({

	employee_status: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('EmployeeStatuses', EmployeeStatusesSchema);