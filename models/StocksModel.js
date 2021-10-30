// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var StocksSchema = new mongoose.Schema({

	itemID: {
		type: String,
		required: true
	},

	stockDescription: {
		type: String,
		required: true
	},

	quantity: {
		type: Number,
		required: true
	},

	unitID: {
		type: String,
		required: true
	},

	supplierID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Stocks', StocksSchema);