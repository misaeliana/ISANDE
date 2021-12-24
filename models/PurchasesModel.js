// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasesSchema = new mongoose.Schema({

	purchaseOrderNumber:{
		type:Number,
		required: true
	},

	supplierID: {
		type: String,
		required: true
	},

	employeeID: {
		type: String,
		required: true
	},

	date: {
		type: Date,
		required: true
	},

	dateReceived: {
		type: Date,
		required: false
	},

	subtotal: {
		type: Number,
		required: false
	},

	vat: {
		type: Number, 
		required: false
	},

	total: {
		type: Number,
		required: false
	},

	discount: {
		type: Number,
		required: false
	},

	statusID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Purchases', PurchasesSchema);