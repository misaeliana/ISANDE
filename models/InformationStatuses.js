// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InformationStatusesSchema = new mongoose.Schema({

	information_status: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('EmployeeStatuses', InformationStatusesSchema);