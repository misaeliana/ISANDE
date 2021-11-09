// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const InventoryTypes = require('../models/InventoryTypeModel.js');

const Units = require('../models/UnitsModel.js');

const inventoryController = {

	getInventoryList: function(req, res) {

		var type = {
			type: "Paint",
		}

		var unit = {
			unit: "Piece"
		}

		/*db.insertOne (Units, unit, function(flag) {
			if (flag) { }
		})*/
	
		/*db.insertOne (InventoryType, type, function(flag) {
			if (flag) { }
		})*/

		function getInventoryTypes() {
			return new Promise((resolve, reject) => {
				db.findMany(InventoryTypes, {}, '', function(result) {
					resolve (result)
				})
			})
		}

		function getUnits() {
			return new Promise((resolve, reject) => {
				db.findMany(Units, {}, '', function(result) {
					resolve (result)
				})
			})
		}

		async function getInformation() {
			var inventoryTypes = await getInventoryTypes();
			var units = await getUnits();
			//console.log(inventoryTypes);

			res.render('inventory', {inventoryTypes, units});
		}

		getInformation();
	},

	postNewItem: function(req, res) {
		var item = {
			itemDescription: req.body.description,
			categoryID: req.body.category,
			unitID: req.body.unit,
			quantityAvailable: 0,
			EOQ: parseFloat(req.body.EOQ),
			reorderLevel: parseFloat(req.body.reorderLevel),
			sellingPrice: parseFloat(req.body.sellingPrice),
			statusID: "Low Stock",
			informationStatusID: "Active"
		}

		db.insertOne(Items, item, function (flag) {
			if (flag) { }
		})

	}
}

module.exports = inventoryController;