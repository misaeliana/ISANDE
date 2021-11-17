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

			res.render('inventory', {inventoryTypes, units, inventory, itemStatuses});
		}

		getInformation();
	},

	getCheckItemDescription: function(req, res) {
		var description = req.query.itemDescription;
		
		async function checkDescription() {
			var deleteID = await getInformationStatus("Active");

			// Look for name
			db.findOne(Items, {itemDescription: description, informationStatusID: deleteID}, 'itemDescription', function (result) {
                
                res.send(result);
            });
		}

		checkDescription();
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

			res.send(updatedItem);
		});

	},

	getViewItem: function(req, res) {

		async function getInformation() {
			var inventoryTypes = await getInventoryTypes();
			var units = await getUnits();

			var item = await getSpecificInventoryItems(req.params.itemID);

			var textStatus = await getSpecificItemStatus(item.statusID);
			var btnStatus;
	
			if (textStatus == "Low Stock") 
				btnStatus = "low";
			else if (textStatus == "In Stock")
				btnStatus = "in";

			var itemInfo = {
				_id: item._id,
				itemDescription: item.itemDescription,
				categoryID: item.categoryID,
				category: await getSpecificInventoryType(item.categoryID),
				unitID: item.unitID,
				unit: await getSpecificUnit(item.unitID),
				quantityAvailable: item.quantityAvailable,
				EOQ: item.EOQ,
				reorderLevel: item.reorderLevel,
				sellingPrice: item.sellingPrice,
				statusID: item.statusID,
				status: textStatus,
				btn_status: btnStatus
			};

			res.render('viewSpecificItem', {itemInfo, inventoryTypes, units});
		}

		getInformation();
		
	},

	postUpdateItemInformation: function(req, res) {

		async function updateItemInfo() {
			var deleteID = await getInformationStatus("Deleted");

			// change current _id status to deleted
			await changeItemInformationStatus(req.body.itemID, deleteID);

			// get id statuses
			var lowStockID = await getSpecificItemStatusID("Low Stock");
			var inStockID = await getSpecificItemStatusID("In Stock");

			var updatedItem = {
				itemDescription: req.body.description,
				categoryID: req.body.category,
				unitID: req.body.unit,
				quantityAvailable: parseFloat(req.body.quantity),
				EOQ: parseFloat(req.body.EOQ),
				reorderLevel: parseFloat(req.body.reorderLevel),
				sellingPrice: parseFloat(req.body.sellingPrice),
				statusID: req.body.itemStatusID,
				informationStatusID: await getInformationStatus("Active")
			};

			// check if status is correct, if not, change
			if ((updatedItem.quantityAvailable > updatedItem.reorderLevel) && (updatedItem.statusID == lowStockID))
				updatedItem.statusID = inStockID;
			else if ((updatedItem.quantityAvailable <= updatedItem.reorderLevel) && (updatedItem.statusID == inStockID))
				updatedItem.statusID = lowStockID;

			// save updated item
			db.insertOneResult(Items, updatedItem, function (result) {
	
				res.send(result);
			});
		}



		updateItemInfo();
	}
};

module.exports = inventoryController;