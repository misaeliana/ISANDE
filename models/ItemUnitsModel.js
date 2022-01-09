// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ItemUnitsSchema = new mongoose.Schema({

	itemID: {
		type: String,
		required: true
	},

	unitID: {
		type: String,
		required: true
	},

	quantity: {
		type: Number,
		required: true
	},

	sellingPrice: {
		type: Number,
		required: true
	},

	informationStatusID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('ItemUnits', ItemUnitsSchema);