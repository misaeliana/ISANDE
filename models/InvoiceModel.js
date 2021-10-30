// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InvoicesSchema = new mongoose.Schema({

	customerID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
		required: true
	},
	
	VAT: {
		type: String,
		required: true
	},
	
	discount: {
		type: String,
		required: true
	},
	
	total: {
		type: String,
		required: true
	},
	
	employeeID: {
		type: String,
		required: true
	}
	
});

module.exports = mongoose.model('Invoices', InvoicesSchema);