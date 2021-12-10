// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PaymentOptionSchema = new mongoose.Schema({

	paymentOption: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('PaymentOption', PaymentOptionSchema);