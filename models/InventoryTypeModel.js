// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var InventoryTypesSchema = new mongoose.Schema({

	type: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('InventoryTypes', InventoryTypesSchema);