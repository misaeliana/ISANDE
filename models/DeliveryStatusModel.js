// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var DeliveryStatusesSchema = new mongoose.Schema({

	deliveryStatus: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('DeliveryStatus', DeliveryStatusSchema);