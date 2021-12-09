// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var ItemCategoriesSchema = new mongoose.Schema({

	category: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('ItemCategories', ItemCategoriesSchema);