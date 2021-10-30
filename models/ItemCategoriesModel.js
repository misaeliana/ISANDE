// import module `mongoose`
var mongoose = require('mongoose');

// defines the schema for collection `users`
var CategoriesSchema = new mongoose.Schema({

	category: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Categories', CategoriesSchema);