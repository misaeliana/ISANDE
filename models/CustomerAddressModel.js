// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var CustomerAddressesSchema = new mongoose.Schema({

	customerID: {
		type: String,
		required: true
	},

	addressTitle: {
		type:String,
		required: true
	},

	address: {
		type: String,
		required: true
	},

	informationStatusID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('CustomerAddresses', CustomerAddressesSchema);