// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchasedStocksSchema = new mongoose.Schema({

	purchaseOrderID: {
		type: String,
		required: true
	},

	stockID: {
		type: String,
		required: true
	},

	price: {
		type: Number,
		required: true
	},

	count: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('PurchasedStocks', PurchasedStocksSchema);