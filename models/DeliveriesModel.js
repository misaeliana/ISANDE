// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DeliveriesSchema = new mongoose.Schema({

	invoice_id: {
		type: String,
		required: true
	},

	customerAddress: {
		type: String,
		required: true
	},

	deliveryDate: {
		type: Date,
		required: true
	},

	dateDelivered: {
		type: Date,
		required: false
	},

	deliveryPersonnel: {
		type: String,
		required: true
	},

	deliveryNotes: {
		type: String,
		required: false
	}
});

module.exports = mongoose.model('Deliveries', DeliveriesSchema);