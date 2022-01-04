// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ItemsSchema = new mongoose.Schema({



	itemDescription: {
		type: String,
		required: true
	},

	categoryID: {
		type: String,
		required: true
	},
	
	unitID: {
		type: String,
		required: true
	},
	
	quantityAvailable: {
		type: Number,
		required: true
	},
	
	EOQ: {
		type: Number,
		required: true
	},
	
	reorderLevel: {
		type: Number,
		required: true
	},

	retailQuantity: {
		type: Number, 
		required: true
	},

	statusID: {
		type: String,
		required: true
	},

	informationStatusID: {
		type: String,
		required: true
	},
});

module.exports = mongoose.model('Items', ItemsSchema);