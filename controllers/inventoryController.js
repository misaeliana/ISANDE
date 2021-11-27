// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const ItemSuppliers = require('../models/ItemSuppliersModel.js');

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

		var supplier = {
			name: "Supplier 1",
			contactPerson: "Juan De La Cruz",
			number: "09170998777",
			email: "juan_cruz@gmail.com",
			address: "1234 Street, Blank City",
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		/*db.insertOne (Suppliers, supplier, function(flag) {
			if (flag) { }
		});*/


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
			var inventoryItems = await getInventoryItems("618a7830c8067bf46fbfd4e4"); // change
			var inventory = [];

			for (var i = 0; i < inventoryItems.length; i++) {
				// update status here
			
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
					sellingPrice: parseFloat(inventoryItems[i].sellingPrice).toFixed(2),
					statusID: inventoryItems[i].statusID,
					status: textStatus,
					btn_status: btnStatus
				};
	
				inventory.push(item);
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
			var itemSuppliers = await getItemSuppliers(req.params.itemID);
			var item = await getSpecificInventoryItems(req.params.itemID);
			var textStatus = await getSpecificItemStatus(item.statusID);
			var btnStatus;

			// Get supplier name 
			for (var i = 0; i < itemSuppliers.length; i++) {
				var supplierDetails = await getSpecificSupplier(itemSuppliers[i].supplierID);
				itemSuppliers[i].supplierID = supplierDetails.name;
			}
	
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
				sellingPrice: parseFloat(item.sellingPrice).toFixed(2),
				statusID: item.statusID,
				status: textStatus,
				btn_status: btnStatus
			};

			res.render('viewSpecificItem', {itemInfo, inventoryTypes, units, itemSuppliers});
		}

		getInformation();
		
	},

	editItemSuppliers: function(req, res) {

		async function getInformation() {
			var itemID = req.params.itemID;
			var suppliers = await getSuppliers();
			var itemSuppliers = await getItemSuppliers(req.params.itemID);

			// Get supplier name 
			for (var i = 0; i < itemSuppliers.length; i++) {
				var supplierDetails = await getSpecificSupplier(itemSuppliers[i].supplierID);
				itemSuppliers[i].supplierID = supplierDetails.name;
			}

			res.render('editItemSuppliers', {itemID, suppliers, itemSuppliers});
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

				// update itemSupplier	
				db.updateMany(ItemSuppliers, {itemID: req.body.itemID}, {$set: {itemID: result._id}}, function(flag) {
					if (flag) { }

					res.send(result);
				});
			});
		}



		updateItemInfo();
	},

	postUpdateItemSuppliers: function(req, res) {

		async function updateItemInfo() {
			var suppliers = JSON.parse(req.body.JSONsupplierNames);
			var itemSuppliers = [];

			for (var i = 0; i < suppliers.length; i++) {
				var itemSupplier = {
					itemID: req.body.itemID,
					supplierID: await getSupplierID(suppliers[i])
				};

				itemSuppliers.push(itemSupplier);
			}

			// delete all item suppliers with ID
			await deleteItemSuppliers(req.body.itemID);

			// save new item suppliers
			db.insertMany(ItemSuppliers, itemSuppliers, function (flag) {
				if (flag) { }
			});
	
			res.send({redirect: '/inventory/' + req.body.itemID});
		}

		updateItemInfo();
	},

	getSearchInventory: function(req, res) {
		var searchItem = req.query.searchItem;

		async function getInformation() {
			var items = [];
			var invoice = await getInventoryItemsFromDescription(searchItem, "618a7830c8067bf46fbfd4e4");

			if (invoice != null) {
				for (var i = 0; i < invoice.length; i++) {
					var textStatus = await getSpecificItemStatus(invoice[i].statusID);
					var btnStatus;
	
					if (textStatus == "Low Stock") 
						btnStatus = "low";
					else if (textStatus == "In Stock")
						btnStatus = "in";
	
					var item = {
						_id: invoice[i]._id,
						itemDescription: invoice[i].itemDescription,
						categoryID: invoice[i].categoryID,
						category: await getSpecificInventoryType(invoice[i].categoryID),
						unit: await getSpecificUnit(invoice[i].unitID),
						quantityAvailable: invoice[i].quantityAvailable,
						sellingPrice: parseFloat(invoice[i].sellingPrice).toFixed(2),
						statusID: invoice[i].statusID,
						status: textStatus,
						btn_status: btnStatus
					};
					items.push(item);
				}
			}

			if (items.length > 0)
                res.send(items);
            else 
                res.send(null);
		}

		getInformation();
	},

	/*getFilterInventory: function(req, res) {
		var typeFilter = req.query.typeFilter;
		var statusFilter = req.query.statusFilter;
		var inventory = [];

		console.log(typeFilter + ", " + statusFilter);

		async function filters() {
			var inventoryItems = await getInventoryItems("618a7830c8067bf46fbfd4e4");

			for (var i = 0; i < inventoryItems.length; i++) {
				if (typeFilter == "all-type" && statusFilter == "all-type") {
					temp = getInformation(inventoryItems[i]);
				} else if (typeFilter == "all-type" && statusFilter != "all-type") {
					if (statusFilter == inventoryItems[i])
						getInformation(inventoryItems[i]);
				} else if (typeFilter != "all-type" && statusFilter == "all-type") {
					if (typeFilter == inventoryItems[i])
						getInformation(inventoryItems[i]);
				} else {
					if (typeFilter == inventoryItems[i].categoryID && statusFilter == inventoryItems[i].statusID) {
						getInformation(inventoryItems[i]);
					}
				}
			}
		}*/

	getFilterInventory: function(req, res) {
		var typeFilter = req.query.typeFilter;
		var statusFilter = req.query.statusFilter;
		var inventoryItems;

		console.log(typeFilter + ", " + statusFilter);

		async function filters() {
			if (typeFilter == "all-type" && statusFilter == "all-type") {
				inventoryItems = await getInventoryItems("618a7830c8067bf46fbfd4e4");
				getInformation(inventoryItems);
			} else if (typeFilter == "all-type" && statusFilter != "all-type") {
				inventoryItems = await getInventoryItemsStatusFilter(statusFilter, "618a7830c8067bf46fbfd4e4");
				getInformation(inventoryItems);
			} else if (typeFilter != "all-type" && statusFilter == "all-type") {
				inventoryItems = await getInventoryItemsTypeFilter(typeFilter, "618a7830c8067bf46fbfd4e4");
				getInformation(inventoryItems);
			} else {
				inventoryItems = await getInventoryItemsStatusTypeFilter(statusFilter, typeFilter, "618a7830c8067bf46fbfd4e4");
				getInformation(inventoryItems);
			}
		}

		async function getInformation(inventoryItems) {
			var inventory = [];

			for (var i = 0; i < inventoryItems.length; i++) {
				var textStatus = await getSpecificItemStatus(inventoryItems[i].statusID);
				var btnStatus;
			
				if (textStatus == "Low Stock") 
					btnStatus = "low";
				else if (textStatus == "In Stock")
					btnStatus = "in";
			
				var item = {
					_id: inventoryItems[i]._id,
					itemDescription: inventoryItems[i].itemDescription,
					categoryID: inventoryItems[i].categoryID,
					category: await getSpecificInventoryType(inventoryItems[i].categoryID),
					unit: await getSpecificUnit(inventoryItems[i].unitID),
					quantityAvailable: inventoryItems[i].quantityAvailable,
					sellingPrice: parseFloat(inventoryItems[i].sellingPrice).toFixed(2),
					statusID: inventoryItems[i].statusID,
					status: textStatus,
					btn_status: btnStatus
				};
				inventory.push(item);
			}

			console.log(inventory);

			if (inventory.length > 0) {
				res.send(inventory);
			}
			else {
				res.send(null);
			}
		}

		filters();
	}
};

module.exports = inventoryController;