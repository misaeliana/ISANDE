// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InvoicesSchema = new mongoose.Schema({

	invoiceID: {
		type: Number,
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

	paymentOptionID: {
		type: String,
		required: true
	},
	
	subtotal: {
		type: Number,
		required: true
	},

	VAT: {
		type: Number,
		required: true
	},
	
	discount: {
		type: Number,
		required: true
	},

	total: {
		type: Number,
		required: true
	},
	
	employeeID: {
		type: String,
		required: true
	}
	
});

module.exports = mongoose.model('Invoices', InvoicesSchema);