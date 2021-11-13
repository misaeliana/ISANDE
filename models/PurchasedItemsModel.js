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

	price: {
		type: Number,
		required: false
	},

	quantity: {
		type: Number,
		required: true
	},

	quantityReceived: {
		type: Number,
		required: false
	},
});

module.exports = mongoose.model('PurchasedItems', PurchasedItemsSchema);