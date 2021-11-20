// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InvoiceTypesSchema = new mongoose.Schema({

	type: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('InvoiceTypes', InvoiceTypesSchema);