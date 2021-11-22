// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasedItemsSchema = new mongoose.Schema({

	purchaseOrderID: {
		type: String,
		required: true
	},

	itemID: {
		type: String,
		required: true
	},

	unitID: {
		type:String,
		required: true
	},

	unitPrice: {
		type: Number,
		required: false
	},

	quantity: {
		type: Number,
		required: true
	},

	amount: {
		type: Number, 
		required: false
	},

	quantityReceived: {
		type: Number,
		required: false
	},
});

module.exports = mongoose.model('PurchasedItems', PurchasedItemsSchema);