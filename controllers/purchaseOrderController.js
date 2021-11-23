// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const Suppliers = require('../models/SuppliersModel.js');

const PurchaseOrderStatus = require('../models/PurchaseOrderStatusModel.js');

const Units = require('../models/UnitsModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedItems = require('../models/PurchasedItemsModel.js');

const purchaseOrderController = {

	getPurchaseOrderList: function(req, res) {


		async function getPurchaseInfo (result) {
			var purchases = []
			for (var i=0; i<result.length; i++) {
				var purchase = {
					poID: result[i]._id,
					date: result[i].date.toLocaleString('en-US'), 
					supplier: await getSupplierName(result[i].supplierID),
					amount: 0, 
					status: await getPurchaseOrderStatus(result[i].statusID)
				}
				purchases.push(purchase)
			}
			res.render('purchaseOrderList', {purchases});
		}

		db.findMany(Purchases, {}, 'date supplierID statusID', function(result) {
			getPurchaseInfo(result);
		})
		
	},

	getCreateNewPurchaseOrder: function(req, res) {
		res.render('newPO');
	},

	getItems: function(req, res) {
		db.findMany (Items, {itemDescription:{$regex:req.query.query, $options:'i'}, informationStatusID: "618a7830c8067bf46fbfd4e4"}, 'itemDescription', function (result) {
			var formattedResults = [];
			//reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
			for (var i=0; i<result.length; i++) {
				var formattedResult = {
					label: result[i].itemDescription,
					value: result[i].itemDescription
				};
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults);
		})
	},

	getItemUnit: function(req, res) {
		db.findOne (Items, {itemDesc:req.body.itemDesc, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'unitID', function(result) {
			db.findOne(Units, {_id: result.unitID}, 'unit', function (result2) {
				res.send(result2.unit)
			})
		})
	},

	saveNewPO: function(req, res) {

		async function saveItems(purchaseID, items) {
			for (var i=0; i<items.length; i++) {
				items[i].purchaseOrderID = purchaseID
				items[i].itemID = await getItemID(items[i].itemDesc);
				items[i].unitID = await getUnitID(items[i].unit)
			}

			db.insertMany(PurchasedItems, items, function(flag) {
				if (flag) {}
			})
		}

		var items = JSON.parse(req.body.itemsString);
		var date = req.body.date
		var purchase = {
			supplierID: "Hello",
			employeeID: "Hi",
			date: date,
			statusID: "618f650546c716a39100a809"
		}
		var purchaseID;
		db.insertOneResult(Purchases, purchase, function(result) {
			purchaseID = result._id;
			saveItems(purchaseID, items)
		})
	},

	getPurchaseOrder: function(req, res) {

		function getPurchasedItems (purchaseID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchasedItems, {purchaseOrderID: purchaseID}, 'itemID unitID quantity', function(result) {
					resolve(result);
				})
			})
		}

		function getPOInfo (poID) {
			return new Promise((resolve, reject) => {
				db.findOne(Purchases, {_id:poID}, 'date dateReceived subtotal vat total', function (result) {
					resolve(result)
				})
			})
		}

		function getReceivedItems(purchaseID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchasedItems, {purchaseOrderID: purchaseID}, 'itemID unitID unitPrice quantity amount quantityReceived', function(result) {
					resolve(result);
				})
			})
		}

		async function getItems(purchaseInfo) {
			var items  = await getPurchasedItems(purchaseInfo._id);
			for (var i=0; i<items.length; i++) {
				items[i].itemDescription = await getItemDescription(items[i].itemID);
				items[i].unitName = await getSpecificUnit(items[i].unitID)
			}

			var poInfo = purchaseInfo
			poInfo.fdateMade = poInfo.date.toLocaleString('en-US');

			//new po
			if (purchaseInfo.statusID == "618f650546c716a39100a809") {
				var newPO = purchaseInfo.statusID
				res.render('viewPO', {items, poInfo, newPO})
			}
			//sent
			else if (purchaseInfo.statusID == "618f652746c716a39100a80a") {
				var sent = purchaseInfo.statusID
				res.render('viewPO', {items, poInfo, sent})
			}

			//received
			else if (purchaseInfo.statusID == "618f654646c716a39100a80c") {
				var poInfo = await getPOInfo (purchaseInfo._id);
				poInfo.fdateMade = poInfo.date.toLocaleString('en-US');
				poInfo.fdateReceived = poInfo.dateReceived.toLocaleString('en-US')

				items = await getReceivedItems(purchaseInfo._id)

				for (var i=0; i<items.length; i++) {
					items[i].itemDescription = await getItemDescription(items[i].itemID);
					items[i].unitName = await getSpecificUnit(items[i].unitID)
				}
				
				var received = purchaseInfo.statusID
				res.render('viewPO', {items, poInfo, received})
			}
		}

		db.findOne(Purchases, {_id:req.params.poID}, '_id supplierID date statusID', function(result) {
			getItems(result)
		})
	},

	generatePurchaseOrder: function(req, res) {

		function getLowItems() {
			return new Promise((resolve, reject) => {
				db.findMany(Items, {statusID:"618b32205f628509c592daab", informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'itemDescription EOQ unitID', function(result) {
					resolve (result);
				})
			})
		}

		async function getItems() {
			var items = await getLowItems();
			var suppliers =  await getSuppliers();

			for (var i=0; i<items.length; i++) {
				items[i].unit = await getSpecificUnit(items[i].unitID);
				items[i].suppliers = suppliers
			}

			res.render('generatePO', {items});
		}

		getItems()
		
	},

	saveGeneratePurchaseOrder: function(req, res) {
		
		function getUniqueSuppliers(items) {
			var suppliers = []

			for (var a=0; a<items.length; a++) {
				//array does not have supplier
				if (!(suppliers.includes(items[a].supplier))) 
					suppliers.push(items[a].supplier)
			}
			return suppliers
		}

		function savePurchase(purchase, poItems) {
			return new Promise ((resolve, reject) => {
				db.insertOneResult(Purchases, purchase, function(result) {
					resolve(result._id)
				})
			})
			
		}

		async function savePO(dateToday, items) {
			var uniqueSuppliers = getUniqueSuppliers(items);

			for (var i=0; i<uniqueSuppliers.length; i++) {

				var poItems = [];
				for (var j=0; j<items.length; j++) {
					if (uniqueSuppliers[i] == items[j].supplier) {
						var item = {
							itemID: await getItemID(items[j].itemDescription),
							unitID: await getUnitID(items[j].unit),
							quantity: items[j].quantity
						}
						poItems.push(item);
					}
				}

				var purchase = {
					supplierID: uniqueSuppliers[i],
					employeeID:"hi",
					date: dateToday,
					statusID: "618f650546c716a39100a809"
				}
				
				var purchaseID = await savePurchase(purchase)
				for (var k=0; k<poItems.length; k++)
						poItems[k].purchaseOrderID = purchaseID

				db.insertMany(PurchasedItems, poItems, function(flag) {
					if (flag) { }
				})
			}
			res.redirect('/purchaseOrderList');
		}
		//------END OF FUNCTIONS-------


		var purchaseItems = JSON.parse(req.body.purchaseString);
		var dateToday = new Date()

		savePO(dateToday, purchaseItems)
	},

	editPO: function(req, res) {
		function getPurchasedItems (purchaseID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchasedItems, {purchaseOrderID: purchaseID}, 'itemID quantity unitID', function(result) {
					resolve(result);
				})
			})
		}

		async function getItems(purchaseInfo, statusID) {
			var items  = await getPurchasedItems(purchaseInfo._id);
			for (var i=0; i<items.length; i++) {
				items[i].itemDescription = await getItemDescription(items[i].itemID);
				items[i].unitName = await getSpecificUnit(items[i].unitID)
			}
			var poID = req.params.poID

			if (statusID == "618f650546c716a39100a809") {
				var newPO = statusID;
				//renders delete button and probably cancel PO button
				res.render('editPO', {items, poID, newPO})
			}
			else if (statusID == "618f652746c716a39100a80a") {
				var sent = statusID;
				//renders input for price 
				res.render('editPO', {items, poID, sent})
			}
		
		}

		db.findOne(Purchases, {_id:req.params.poID}, '_id supplierID date statusID', function(result) {
			getItems(result, result.statusID)
		})
	},

	//update function for new PO, add new items, delete items
	updatePOItems: function(req, res) {

		function getCurrentPOItems(poID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchasedItems, {purchaseOrderID:poID}, 'itemID quantity', function(result) {
					resolve(result);
				})
			})
		}

		function updatePurchaseItems(itemID, newQuantity, poID) {
			db.updateOne(PurchasedItems, {purchaseOrderID: poID, itemID:itemID}, {quantity: newQuantity}, function(result) {

			})
		}

		function removeItem (itemID, poID) {
			db.deleteOne(PurchasedItems, {purchaseOrderID: poID, itemID:itemID}, function(flag) {
				if (flag) { }
			})
		}

		function addItem (item, poID) {
			item.purchaseOrderID = poID
			db.insertOne(PurchasedItems, item, function(flag) {
				if (flag) { }
			})
		}

		async function updatePO(items, poID) {
			var currentPOItems = await getCurrentPOItems(poID);

			for (var i=0; i<items.length; i++)
				items[i].itemID = await getItemID(items[i].itemDesc)

			for (var i=0; i<currentPOItems.length; i++) {
				currentPOItems[i].checked = false
				
				for (var j=0; j<items.length; j++) {
					items[j].checked = false

					if (currentPOItems[i].itemID == items[j].itemID) {
						//items not chcked in currentPO means it was removed
						currentPOItems[i].checked = true
						//items not checked in items means it was added
						items[j].checked = true
						//quantty was updated
						if (currentPOItems[i].quantity != items[j].quantity)
							updatePurchaseItems(items[j].itemID, items[j].quantity, poID)
					} 
				}
			}

			for (var i=0; i<currentPOItems.length; i++) {
				if (!currentPOItems[i].checked) {
					removeItem (currentPOItems[i].itemID, poID)
				}
			}

			for (var i=0; i<items.length; i++) {
				if (!items[i].checked) {
					items[i].unitID = await getUnitID(items[i].unit)
					addItem (items[i], poID)
				}
			}
		}

		//-------END OF FUNCTIONS--------

		var items = JSON.parse(req.body.itemsString);
		var poID = req.body.poID;

		updatePO(items, poID);
	},

	updatePOStatus: function(req, res) {
		db.updateOne(Purchases, {_id:req.body.poID}, {statusID:"618f652746c716a39100a80a"},function(flag) {
			if (flag) { }
		})
	},

	//update function for sent PO, update with prices and quantity received
	updatePOWithPrice: function(req, res) {

		function getCurrentPOItems(poID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchasedItems, {purchaseOrderID:poID}, 'itemID quantity', function(result) {
					resolve(result);
				})
			})
		}

		function updatePOItemInfo (poID, item) {
			db.updateOne (PurchasedItems, {purchaseOrderID:poID, itemID:item.itemID}, {$set: {unitPrice:item.price, amount:item.amount, quantityReceived: item.quantityReceived}}, function(flag) {
				if (flag) { }
			})
		}

		async function updatePO(items, poID) {
			var currentPOItems = await getCurrentPOItems(poID);

			for (var i=0; i<currentPOItems.length; i++) {
				items[i].itemID = await getItemID(items[i].itemDesc)
				updatePOItemInfo(poID, items[i]);
			}

			var complete = true
			for (var i=0; i<currentPOItems.length && complete; i++) {
				if (currentPOItems.quantity != currentPOItems.quantityReceived)
					complete = false
			}

			if (complete) { //status is received
				db.updateOne(Purchases, {_id: poID}, {statusID: "618f654646c716a39100a80c"}, function (flag) {
				})
			}
			else { //status is incomplete				
				db.updateOne(Purchases, {_id:poID}, {statusID:"618f653746c716a39100a80b"}, function(flag) {
				})
			}
		}

		//-------END OF FUNCTIONS-------
		
		var items = JSON.parse(req.body.itemsString);
		var poID = req.body.poID;
		var subtotal = req.body.subtotal;
		var vat  = req.body.vat;
		var total = req.body.total;
		var dateReceived = new Date();

		db.updateOne(Purchases, {_id:poID}, {$set: {dateReceived: dateReceived, subtotal:subtotal, vat: vat, total:total}}, function(flag) {
				updatePO(items, poID);
		})
	}

}

module.exports = purchaseOrderController;