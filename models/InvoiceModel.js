// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InvoicesSchema = new mongoose.Schema({

	invoiceID: {
		type: String,
		required: true
	},
	
	customerID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
		required: true
	},

	typeID: {
		type: String,
		required: true
	},

	statusID: {
		type: String,
		required: true
	},
	
	subtotal: {
		type: Number,
		required: true
	},
	
	discountPercentage: {
		type: Number,
		required: true
	},
	
	employeeID: {
		type: String,
		required: true
	}
	
});

module.exports = mongoose.model('Invoices', InvoicesSchema);