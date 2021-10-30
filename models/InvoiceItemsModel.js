// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InvoicesItemsSchema = new mongoose.Schema({

	invoiceID: {
		type: String,
		required: true
	},
	
	itemID: {
		type: String,
		required: true
	},
	
	employeeID: {
		type: String,
		required: true
	},
	
	quantity: {
		type: Number, 
		required: true
	}
});

module.exports = mongoose.model('InvoiceItems', InvoiceItemsSchema);