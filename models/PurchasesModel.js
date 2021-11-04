// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasesSchema = new mongoose.Schema({

	customerID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
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

module.exports = mongoose.model('Purchases', PurchasesSchema);