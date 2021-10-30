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

module.exports = mongoose.model('Purchases', PurchasesSchema);