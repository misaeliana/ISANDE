// import module `database` from `../models/db.js`
const db = require('../models/db.js');

require('../controllers/helpers.js')();

const inventoryController = {

	getInventoryList: function(req, res) {

		var type = {
			type: "Paint",
		};

		var unit = {
			unit: "Piece"
		};

		var itemStatus = {
			status: "Low Stock"
		};

		/*db.insertOne (ItemStatuses, itemStatus, function(flag) {
			if (flag) { }
		});*/

		/*db.insertOne (Units, unit, function(flag) {
			if (flag) { }
		})*/
	
		/*db.insertOne (InventoryType, type, function(flag) {
			if (flag) { }
		})*/

		async function getInformation() {
			var inventoryTypes = await getInventoryTypes();
			var units = await getUnits();
			var itemStatuses = await getItemStatuses();
			var inventoryItems = await getInventoryItems();

			for (var i = 0; i < inventoryItems.length; i++) {
				inventoryItems[i].unitID = await getSpecificUnit(inventoryItems[i].unitID);
				inventoryItems[i].statusID = await getSpecificItemStatus(inventoryItems[i].statusID);
			} 

			console.log(inventoryItems);

			res.render('inventory', {inventoryTypes, units, inventoryItems, itemStatuses});
		}

		getInformation();
	},

	postNewItem: function(req, res) {
		console.log(req.body.description);

		var item = {
			itemDescription: req.body.description,
			categoryID: req.body.category,
			unitID: req.body.unit,
			quantityAvailable: 0,
			EOQ: parseFloat(req.body.EOQ),
			reorderLevel: parseFloat(req.body.reorderLevel),
			sellingPrice: parseFloat(req.body.sellingPrice),
			statusID: "618b32205f628509c592daab",
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Items, item, function (result) {
			res.send(result);
		});

	}
};

module.exports = inventoryController;