// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InformationStatusSchema = new mongoose.Schema({

	informationStatus: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('InformationStatus', InformationStatusSchema);