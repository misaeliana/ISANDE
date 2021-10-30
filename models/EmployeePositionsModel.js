// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var EmployeePositionsSchema = new mongoose.Schema({

	position: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('EmployeePositions', EmployeePositionsSchema);