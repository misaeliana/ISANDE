// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

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
			var inventory = [];

			for (var i = 0; i < inventoryItems.length; i++) {
				// update status here

				if (inventoryItems[i].informationStatusID == "618a7830c8067bf46fbfd4e4") {
					var textStatus = await getSpecificItemStatus(inventoryItems[i].statusID);
					var btnStatus;
	
					if (textStatus == "Low Stock") 
						btnStatus = "low";
					else if (textStatus == "In Stock")
						btnStatus = "in";
	
					// check information status
	
					var item = {
						_id: inventoryItems[i]._id,
						itemDescription: inventoryItems[i].itemDescription,
						categoryID: inventoryItems[i].categoryID,
						category: await getSpecificInventoryType(inventoryItems[i].categoryID),
						unit: await getSpecificUnit(inventoryItems[i].unitID),
						quantityAvailable: inventoryItems[i].quantityAvailable,
						sellingPrice: inventoryItems[i].sellingPrice,
						statusID: inventoryItems[i].statusID,
						status: textStatus,
						btn_status: btnStatus
					};
	
					inventory.push(item);
				}
			} 

			console.log(inventory);

			res.render('inventory', {inventoryTypes, units, inventory, itemStatuses});
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
			statusID: "618b32205f628509c592daab",
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Items, item, function (result) {
			console.log(result);
			var updatedItem = {
				_id: result._id,
				itemDescription: result.itemDescription,
				categoryID: result.categoryID,
				category: req.body.categoryText,
				unit: req.body.unitText,
				quantityAvailable: result.quantityAvailable,
				sellingPrice: result.sellingPrice,
				statusID: result.statusID
			};
			console.log(updatedItem);

			res.send(updatedItem);
		});

	}
};

module.exports = inventoryController;