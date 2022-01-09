// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ItemSuppliersSchema = new mongoose.Schema({

	itemID: {
		type: String,
		required: true
    },

    unitID: {
    	type:String,
    	required:true
    },
    
    supplierID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('ItemSuppliers', ItemSuppliersSchema);