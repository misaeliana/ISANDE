// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var PurchaseOrderStatusSchema = new mongoose.Schema({

	purchaseOrderStatus: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('PurchaseOrderStatus', PurchaseOrderStatusSchema);