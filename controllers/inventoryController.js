// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const ItemSuppliers = require('../models/ItemSuppliersModel.js');

const PurchaseItem = require('../models/PurchasedItemsModel.js');

const PurchaseOrders = require('../models/PurchasesModel.js');

const ItemUnits = require('../models/ItemUnitsModel.js');

require('../controllers/helpers.js')();

const inventoryController = {

	getInventoryList: function(req, res) {


		async function getInformation() {
			var itemCategories = await getItemCategories();
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
				else if (textStatus == "Out of Stock")
					btnStatus = "out";
	
				// check information status
	
				var item = {
					_id: inventoryItems[i]._id,
					itemDescription: inventoryItems[i].itemDescription,
					categoryID: inventoryItems[i].categoryID,
					category: await getSpecificItemCategory(inventoryItems[i].categoryID),
					unit: await getSpecificUnit(inventoryItems[i].unitID),
					quantityAvailable: inventoryItems[i].quantityAvailable,
					statusID: inventoryItems[i].statusID,
					status: textStatus,
					btn_status: btnStatus
				};
	
				inventory.push(item);
			}

			//sort function 
			// if return value is > 0 sort b before a
			// if reutrn value is < 0 sort a before b
			inventory.sort(function(a, b) {
			    var textA = a.itemDescription.toUpperCase();
			    var textB = b.itemDescription.toUpperCase();
			    //syntax is "condition ? value if true : value if false"
			    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			}); 

			res.render('inventory', {itemCategories, units, inventory, itemStatuses});
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
			retailQuantity: parseFloat(req.body.retailQuantity),
			statusID: "61b0d6751ca91f5969f166de",
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Items, item, function (result) {

			if(req.body.sellingPrice!="") {
				var itemUnit = {
					itemID: result._id,
					unitID: req.body.unit, 
					sellingPrice: parseFloat(req.body.sellingPrice),
					quantity: 1,
					informationStatusID:"618a7830c8067bf46fbfd4e4"
				}
				db.insertOne(ItemUnits, itemUnit, function(flag) {

				})
			}

			res.sendStatus(200)
		});

	},

	getViewItem: function(req, res) {

		function getMatchItems(itemID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchaseItem, {itemID:itemID}, 'purchaseOrderID unitID quantity', function(result) {
					resolve(result)
				})
			})
		}

		function checkPOStatus(poItem) {
			return new Promise((resolve, reject) => {
				db.findOne(PurchaseOrders, {_id:poItem.purchaseOrderID}, 'statusID', function(result) {					//po is released
					//po is released
					if (result.statusID == "618f652746c716a39100a80a")
						resolve(true)
					//po is of other status
					else
						resolve(false)
				})
			})
		}

		async function getToBeReceived(item) {
			var poItems = await getMatchItems(item._id)
			var toBeReceived = 0;

			for (var i=0; i<poItems.length; i++) {
				//po is released
				var released = await checkPOStatus(poItems[i])
				if (released) {
					if (item.unitID != poItems[i].unitID) {
						convertedAmount = poItems[i].quantity / item.retailQuantity
						toBeReceived += parseFloat(convertedAmount)
					}
					else
						toBeReceived += parseInt(poItems[i].quantity)
				}
			}
			return toBeReceived;
		}


		async function getInformation() {
			var itemCategories = await getItemCategories();
			var units = await getUnits();
			var itemSuppliers = await getItemSuppliers(req.params.itemID);
			var item = await getSpecificInventoryItems(req.params.itemID);
			var textStatus = await getSpecificItemStatus(item.statusID);
			var btnStatus;

			// Get supplier name 
			for (var i = 0; i < itemSuppliers.length; i++) {
				var supplierDetails = await getSpecificSupplier(itemSuppliers[i].supplierID);
				itemSuppliers[i].supplierID = supplierDetails.name;
				itemSuppliers[i].unit = await getSpecificUnit(itemSuppliers[i].unitID) 
			}
	
			if (textStatus == "Low Stock") 
				btnStatus = "low";
			else if (textStatus == "In Stock")
				btnStatus = "in";
			else if (textStatus == "Out of Stock")
				btnStatus = "out"

			var itemInfo = {
				_id: item._id,
				itemDescription: item.itemDescription,
				categoryID: item.categoryID,
				category: await getSpecificItemCategory(item.categoryID),
				unitID: item.unitID,
				unit: await getSpecificUnit(item.unitID),
				quantityAvailable: item.quantityAvailable,
				EOQ: item.EOQ,
				reorderLevel: item.reorderLevel,
				statusID: item.statusID,
				status: textStatus,
				retailQuantity: item.retailQuantity,
				btn_status: btnStatus
			};

			var temp_itemUnits = await getItemUnits(item._id)
			var itemUnits = []

			for (var i=0; i<temp_itemUnits.length; i++) {
				var itemUnit = {
					unitName: await getSpecificUnit(temp_itemUnits[i].unitID),
					ratio:temp_itemUnits[i].quantity,
					sellingPrice: temp_itemUnits[i].sellingPrice,
					availableStock: parseFloat(itemInfo.quantityAvailable * itemInfo.retailQuantity / temp_itemUnits[i].quantity).toFixed(2)
				}
				itemUnits.push(itemUnit)
			}

			getToBeReceived(itemInfo).then((result) =>{
				itemInfo.toBeReceived = result
				res.render('viewSpecificItem', {itemInfo, itemUnits, itemCategories, units, itemSuppliers});
			})
		}

		getInformation();
		
	},

	editItemSuppliers: function(req, res) {

		async function getInformation() {
			var itemID = req.params.itemID;
			var suppliers = await getSuppliers();
			var itemSuppliers = await getItemSuppliers(req.params.itemID);
			var units = await getUnits()

			// Get supplier name 
			for (var i = 0; i < itemSuppliers.length; i++) {
				console.log(itemSuppliers[i])
				var supplierDetails = await getSpecificSupplier(itemSuppliers[i].supplierID);
				itemSuppliers[i].supplierID = supplierDetails.name;
				itemSuppliers[i].unit = await getSpecificUnit(itemSuppliers[i].unitID)
			}

			var itemName = await getItemDescription(itemID)

			res.render('editItemSuppliers', {itemID, itemName, suppliers, itemSuppliers, units});
		}

		getInformation();
	},

	postUpdateItemInformation: function(req, res) {

		function updatePurchaseItems(oldItemID, newItemID) {
			db.updateMany(PurchaseItem, {itemID:oldItemID}, {itemID:newItemID}, function(result) {
			})
		}

		function updateItemSuppliers(oldItemID, newItemID) {
			db.updateMany(ItemSuppliers, {itemID:oldItemID}, {itemID:newItemID}, function(result) {
			})
		}

		async function updateItemInfo() {
			var deletedItemID = req.body.itemID
			var deleteID = await getInformationStatus("Deleted");

			// change current _id status to deleted
			await changeItemInformationStatus(req.body.itemID, deleteID);

			// get id statuses
			var lowStockID = await getSpecificItemStatusID("Low Stock");
			var inStockID = await getSpecificItemStatusID("In Stock");

			var updatedItem = {
				itemDescription: req.body.itemDescription,
				categoryID: req.body.category,
				unitID: req.body.unit,
				quantityAvailable: parseFloat(req.body.quantity),
				EOQ: parseFloat(req.body.EOQ),
				reorderLevel: parseFloat(req.body.reorderLevel),
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
				updateItemSuppliers(deletedItemID, result._id);
				//update po items
				updatePurchaseItems(deletedItemID, result._id);
				res.send(result)
			});
		}



		updateItemInfo();
	},

	postUpdateItemSuppliers: function(req, res) {

		async function updateItemInfo() {
			var supplierInfos = JSON.parse(req.body.JSONsupplierInfos);
			var itemSuppliers = [];
			for (var i = 0; i < supplierInfos.length; i++) {
				var itemSupplier = {
					itemID: req.body.itemID,
					unitID: await getUnitID(supplierInfos[i].unit),
					supplierID: await getSupplierID(supplierInfos[i].supplierName)
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
						category: await getSpecificItemCategory(invoice[i].categoryID),
						unit: await getSpecificUnit(invoice[i].unitID),
						quantityAvailable: invoice[i].quantityAvailable,
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
					category: await getSpecificItemCategory(inventoryItems[i].categoryID),
					unit: await getSpecificUnit(inventoryItems[i].unitID),
					quantityAvailable: inventoryItems[i].quantityAvailable,
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
	},


	//NEW STUFF
	newSellingUnit: function(req, res) {
		var itemUnit = {
			itemID: req.body.itemID,
			unitID: req.body.unit, 
			quantity: parseFloat(req.body.quantity),
			sellingPrice: parseFloat(req.body.sellingPrice),
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		}

		db.insertOne(ItemUnits, itemUnit, function (flag) {
			if (flag)
				res.sendStatus(200);
		})
	},

	deleteSellingUnit: function(req, res) {
		var itemID = req.body.itemID;
		var unitName = req.body.unitName;
		
		async function deleteInfo() {
			var unitID = await getUnitID(unitName);

			var flag = await deleteItemUnit(itemID, unitID,  await getInformationStatus("Active"), await getInformationStatus("Deleted"));

			if (flag)
				res.sendStatus(200);
		}

		deleteInfo();
	},

	editSellingUnit: function(req, res) {
		var itemID = req.body.itemID;
		var unitName = req.body.unitName;
		var newSellingPrice = req.body.newSellingPrice;
		
		async function editInfo() {
			var unitID = await getUnitID(unitName);
			var oldItemUnit = await getItemUnitID(itemID, unitID);

			// change current _id status to deleted
			await deleteItemUnit(itemID, unitID, await getInformationStatus("Active"), await getInformationStatus("Deleted"));

			var updatedItemUnit = {
				itemID: oldItemUnit.itemID,
				unitID: oldItemUnit.unitID,
				quantity: parseFloat(oldItemUnit.quantity),
				sellingPrice: parseFloat(newSellingPrice),
				informationStatusID: await getInformationStatus("Active")
			};

			console.log(updatedItemUnit);

			db.insertOne(ItemUnits, updatedItemUnit, function (flag) {
				if (flag)
					res.sendStatus(200);
			})

		}

		editInfo();
	}
};

module.exports = inventoryController;