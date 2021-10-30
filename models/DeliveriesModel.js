// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DeliveriesSchema = new mongoose.Schema({

	invoiceID: {
		type: String,
		required: true
	},

	customerID: {
		type: String,
		required: true
	},

	deliveryStatus: {
		type: String,
		required: true
	},

	employeeID: {
		type: String,
		required: true
	},

	dateDeliveredID: {
		type: Date,
		required: true
	},
});

module.exports = mongoose.model('Deliveries', DeliveriesSchema);