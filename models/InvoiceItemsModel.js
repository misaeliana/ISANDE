// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InvoicesItemsSchema = new mongoose.Schema({

	invoice_id: {
		type: String,
		required: true
	},
	
	itemID: {
		type: String,
		required: true
	},
	
	quantity: {
		type: String,
		required: true
	},
	
	discount: {
		type: Number, 
		required: true
	}
});

module.exports = mongoose.model('InvoiceItems', InvoicesItemsSchema);