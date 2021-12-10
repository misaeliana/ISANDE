// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var OnAccountPaymentSchema = new mongoose.Schema({

	invoiceID: {
		type: String,
		required: true
	},

	datePaid: {
		type: Date, 
		required: true
	},

	amountPaid: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('OnAccountPayment', OnAccountPaymentSchema);