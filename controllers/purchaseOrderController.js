// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const ItemStatus = require('../models/ItemStatusModel.js');

const Suppliers = require('../models/SuppliersModel.js');

const PurchaseOrderStatus = require('../models/PurchaseOrderStatusModel.js');

const Units = require('../models/UnitsModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedItems = require('../models/PurchasedItemsModel.js');

const ItemSuppliers = require('../models/ItemSuppliersModel.js');

const path = require('path');

const fs = require('fs');

const PizZip = require("pizzip");

const Docxtemplater = require("docxtemplater");


const purchaseOrderController = {

	getPurchaseOrderList: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login');

		else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
			async function getPurchaseInfo (result) {
				var purchases = [];
				for (var i=0; i<result.length; i++) {
					var date = new Date(result[i].date);
					var purchase = {
						poID: result[i]._id,
						date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(), 
						poNumber: result[i].purchaseOrderNumber,
						supplier: await getSupplierName(result[i].supplierID),
						amount: numberWithCommas(parseFloat(result[i].total).toFixed(2)), 
						status: await getPurchaseOrderStatus(result[i].statusID)
					};
					purchases.push(purchase);
				}
				var statuses = await getAllPurchaseOrderStatus();
				//res.render('purchaseOrderList', {purchases, statuses});

				if(req.session.position == "Inventory and Purchasing"){
					var inventoryAndPurchasing = req.session.position;
					res.render('purchaseOrderList', {purchases, statuses, inventoryAndPurchasing});	
				}

				if(req.session.position == "Manager"){
					var manager = req.session.position;
					res.render('purchaseOrderList', {purchases, statuses, manager});
				}
			}

			db.findMany(Purchases, {statusID: {$ne:"61a632b4f6780b76e175421f"}}, 'date purchaseOrderNumber supplierID statusID total', function(result) {
				getPurchaseInfo(result);
			});
		}
	},

	getCreateNewPurchaseOrder: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login');

		else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
			db.findMany(Purchases, {}, '', function(result) {
				var length = result.length - 1;
				var newPONumber; 

				//no PO in the db yet
				if (length == -1)
					newPONumber = 1;
				else
					newPONumber = result[length].purchaseOrderNumber+1;

				//res.render('newPO', {newPONumber});
				
				if(req.session.position == "Inventory and Purchasing"){
					var inventoryAndPurchasing = req.session.position;
					res.render('newPO', {newPONumber, inventoryAndPurchasing});	
				}

				if(req.session.position == "Manager"){
					var manager = req.session.position;
					res.render('newPO', {newPONumber, manager});
				}
			});
		}
	},

	getItems: function(req, res) {

		function getItems(supplierID) {
			return new Promise((resolve, reject) => {
				var items = [];
				db.findMany(ItemSuppliers, {supplierID:supplierID}, 'itemID', function(result) {
					for (var i=0; i<result.length; i++) {
						if (!items.includes(result[i].itemID))
							items.push(result[i].itemID);
					}
					resolve (items);
				});
			});
		}

		//source for regex
		//https://blog.sessionstack.com/how-javascript-works-regular-expressions-regexp-e187e9082913

		async function getFilteredItems() {
			var supplierID = await getSupplierID(req.query.supplier);
			var items = await getItems(supplierID);
			var formattedResults = [];
			var query = new RegExp(req.query.query, 'i');
			var itemNames = [];

			for (var i=0; i<items.length; i++){
				var itemName = await getItemDescription(items[i]);
				if (!itemNames.includes(itemName))
					itemNames.push(itemName);
			}

			for (var i=0; i<itemNames.length; i++) {
				if (query.test(itemNames[i])) {
					var formattedResult = {
						label: await getItemDescription(items[i]),
						value: await getItemDescription(items[i])
					};
					formattedResults.push(formattedResult);
				}
			}
			res.send(formattedResults);
		}
		getFilteredItems();
	},


	getEOQ: function(req, res) {
		db.findOne (Items, {itemDescription:req.query.itemDesc, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'EOQ', function(result) {
			res.send(result.EOQ.toString());
		});
	},

	previousPONumber: function(req, res) {
		db.findMany(Purchases, {}, '', function(result) {

			if (result.length == 0)
				res.send("none");
			else {
				var length = result.length-1;
				var prevPoNumber = result[length].purchaseOrderNumber.toString();
				res.send(prevPoNumber);
			}
		});
	},

	saveNewPO: function(req, res) {

		async function saveItems(purchaseID, items) {
			for (var i=0; i<items.length; i++) {
				items[i].purchaseOrderID = purchaseID;
				items[i].itemID = await getItemID(items[i].itemDesc);
				items[i].unitID = await getUnitID(items[i].unit);
			}

			db.insertMany(PurchasedItems, items, function(flag) {
				if (flag) {
					res.sendStatus(200);
				}
			});
		}

		async function savePurchase() {
			var items = JSON.parse(req.body.itemsString);
			var date = new Date();
			var purchase = {
				purchaseOrderNumber: req.body.poNumber,
				supplierID: await getSupplierID(req.body.supplierName),
				employeeID: req.session._id,
				date: date,
				vat: 0,
				subtotal: 0,
				discount: 0,
				total: 0,
				statusID: "618f650546c716a39100a809"
			};
			var purchaseID;
			db.insertOneResult(Purchases, purchase, function(result) {
				purchaseID = result._id;
				saveItems(purchaseID, items);
			});
		}

		savePurchase();
	},

	getPurchaseOrder: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login')

		else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
			function getPOInfo (poID) {
				return new Promise((resolve, reject) => {
					db.findOne(Purchases, {_id:poID}, 'purchaseOrderNumber employeeID date dateReceived subtotal discount vat total', function (result) {
						resolve(result);
					});
				});
			}

			function getReceivedItems(purchaseID) {
				return new Promise((resolve, reject) => {
					db.findMany(PurchasedItems, {purchaseOrderID: purchaseID}, 'itemID unitID unitPrice quantity amount quantityReceived', function(result) {
						resolve(result);
					});
				});
			}

			async function getItems(purchaseInfo) {
				var items  = await getCurrentPOItems(purchaseInfo._id);
				for (var i=0; i<items.length; i++) {
					items[i].itemDescription = await getItemDescription(items[i].itemID);
					items[i].unitName = await getSpecificUnit(items[i].unitID);
				}

				items.sort(function(a, b) {
					var textA = a.itemDescription.toUpperCase();
					var textB = b.itemDescription.toUpperCase();
					//syntax is "condition ? value if true : value if false"
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				var poInfo = purchaseInfo
				var supplier = await getSpecificSupplier(poInfo.supplierID);
				poInfo.fdateMade = poInfo.date.toLocaleString('en-US');
				poInfo.employeeName = await getEmployeeName(poInfo.employeeID);

				//new po
				if (purchaseInfo.statusID == "618f650546c716a39100a809") {
					var newPO = purchaseInfo.statusID;
					//res.render('viewPO', {items, poInfo, newPO, supplier});

					if(req.session.position == "Inventory and Purchasing"){
						var inventoryAndPurchasing = req.session.position;
						res.render('viewPO', {items, poInfo, newPO, supplier, inventoryAndPurchasing});	
					}
		
					if(req.session.position == "Manager"){
						var manager = req.session.position;
						res.render('viewPO', {items, poInfo, newPO, supplier, manager});
					}
				}
				//sent
				else if (purchaseInfo.statusID == "618f652746c716a39100a80a") {
					var released = purchaseInfo.statusID
					//res.render('viewPO', {items, poInfo, released, supplier});

					if(req.session.position == "Inventory and Purchasing"){
						var inventoryAndPurchasing = req.session.position;
						res.render('viewPO', {items, poInfo, released, supplier, inventoryAndPurchasing});	
					}
		
					if(req.session.position == "Manager"){
						var manager = req.session.position;
						res.render('viewPO', {items, poInfo, released, supplier, manager});
					}
				}

				//incomplete
				/*else if (purchaseInfo.statusID == "618f653746c716a39100a80b") {
					var incomplete = purchaseInfo.statusID;
					res.render('viewPO', {items, poInfo, incomplete, supplier});
				}*/

				//received
				else if (purchaseInfo.statusID == "618f654646c716a39100a80c" || purchaseInfo.statusID == "618f653746c716a39100a80b") {
					var poInfo = await getPOInfo (purchaseInfo._id);
					poInfo.fdateMade = poInfo.date.toLocaleString('en-US');
					poInfo.fdateReceived = poInfo.dateReceived.toLocaleString('en-US');
					poInfo.employeeName =  await getEmployeeName(poInfo.employeeID);

					items = await getReceivedItems(purchaseInfo._id);

					for (var i=0; i<items.length; i++) {
						items[i].itemDescription = await getItemDescription(items[i].itemID);
						items[i].unitName = await getSpecificUnit(items[i].unitID);
						items[i].funitPrice = numberWithCommas(items[i].unitPrice?.toFixed(2));
						items[i].famount = numberWithCommas(items[i].amount?.toFixed(2));
					}			
					
					poInfo.fvat = numberWithCommas(poInfo.vat?.toFixed(2));
					poInfo.fsubtotal = numberWithCommas(poInfo.subtotal?.toFixed(2));
					poInfo.ftotal = numberWithCommas(poInfo.total?.toFixed(2));
					//poInfo.ftotal = poInfo.total.toFixed(2);
					poInfo.fdiscount = numberWithCommas(poInfo.discount?.toFixed(2));

					//incomplete
					if (purchaseInfo.statusID == "618f653746c716a39100a80b") {
						var incomplete = purchaseInfo.statusID;
						var received = purchaseInfo.statusID;
						//res.render('viewPO', {supplier, items, poInfo, incomplete, received});

						if(req.session.position == "Inventory and Purchasing"){
							var inventoryAndPurchasing = req.session.position;
							res.render('viewPO', {supplier, items, poInfo, incomplete, received, inventoryAndPurchasing});	
						}
			
						if(req.session.position == "Manager"){
							var manager = req.session.position;
							res.render('viewPO', {supplier, items, poInfo, incomplete, received, manager});
						}
					}
					//received
					else {
						var received = purchaseInfo.statusID;
						//res.render('viewPO', {supplier, items, poInfo, received});

						if(req.session.position == "Inventory and Purchasing"){
							var inventoryAndPurchasing = req.session.position;
							res.render('viewPO', {supplier, items, poInfo, received, inventoryAndPurchasing});	
						}
			
						if(req.session.position == "Manager"){
							var manager = req.session.position;
							res.render('viewPO', {supplier, items, poInfo, received, manager});
						}
					}
				}
			}

			db.findOne(Purchases, {_id:req.params.poID}, '_id purchaseOrderNumber supplierID employeeID date statusID', function(result) {
				getItems(result);
			});
		}
	},

	generatePurchaseOrder: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login')

		else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
			function getLowItems() {
				return new Promise((resolve, reject) => {
					db.findMany(Items, {$and:[ {$or:[{statusID:"618b32205f628509c592daab"}, {statusID:"61b0d6751ca91f5969f166de"}]}, {informationStatusID:"618a7830c8067bf46fbfd4e4"} ]}, '', function(result) {
						resolve (result);
					});
				});
			}

			function filterSuppliers(suppliers) { 
				var supplierNames = []
				var finalSuppliers = []
				for (var a=0; a<suppliers.length; a++) {
					if (!supplierNames.includes(suppliers[a].name)) {
						supplierNames.push(suppliers[a].name)
						finalSuppliers.push(suppliers[a])
					}
				}
				return finalSuppliers
			}

			async function getItems() {
				var items = await getLowItems();

				for (var i=0; i<items.length; i++) {

					var temp_suppliers = await getItemSuppliers(items[i]._id);
					var suppliers = []
					for (var j=0; j<temp_suppliers.length; j++) {
						var supplier = {
							_id: temp_suppliers[j].supplierID,
							name: await getSupplierName(temp_suppliers[j].supplierID)
						}
						suppliers.push(supplier)
					}
					items[i].category = await getSpecificItemCategory(items[i].categoryID)
					items[i].suppliers = filterSuppliers(suppliers)
					items[i].unit = await getSpecificUnit(items[i].unitID)
				}

				items.sort(function(a, b) {
					var textA = a.itemDescription.toUpperCase();
					var textB = b.itemDescription.toUpperCase();
					//syntax is "condition ? value if true : value if false"
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				var itemCategories = await getItemCategories()
				//res.render('generatePO', {items, itemCategories})

				if(req.session.position == "Inventory and Purchasing"){
					var inventoryAndPurchasing = req.session.position;
					res.render('generatePO', {items, inventoryAndPurchasing});	
				}

				if(req.session.position == "Manager"){
					var manager = req.session.position;
					res.render('generatePO', {items, manager});
				}
			}

			getItems();
		}
	},

	addItemSupplier: function(req, res) {

		async function add(itemID, unitID, supplierID) {
			var item = {
				itemID: itemID.toString(),
				unitID: unitID.toString(),
				supplierID: supplierID.toString()
			}
		
			db.insertOne(ItemSuppliers, item, function(result) {
				res.send(supplierID.toString());
			})
		}

		async function check() {
			var itemID = await getItemID(req.body.itemDesc)
			var unitID = await getUnitID(req.body.unit)
			var supplierID = await getSupplierID(req.body.supplierName)

			db.findOne(ItemSuppliers, {itemID:itemID, unitID:unitID, supplierID:supplierID}, '', function(result) {
				if (result == null)
					add(itemID, unitID, supplierID);
				else
					res.send("exists");
			})
		}
		check();
	},

	saveGeneratePurchaseOrder: function(req, res) {
		
		function getUniqueSuppliers(items) {
			var suppliers = [];

			for (var a=0; a<items.length; a++) {
				//array does not have supplier
				if (!(suppliers.includes(items[a].supplier))) 
					suppliers.push(items[a].supplier);
			}
			return suppliers;
		}

		function savePurchase(purchase, poItems) {
			return new Promise ((resolve, reject) => {
				db.insertOneResult(Purchases, purchase, function(result) {
					resolve(result._id);
				});
			});
		}

		async function savePO(dateToday, items) {
			var uniqueSuppliers = getUniqueSuppliers(items);

			for (var i=0; i<uniqueSuppliers.length; i++) {

				var purchase = {
					purchaseOrderNumber: await getPONumber(),
					supplierID: uniqueSuppliers[i],
					employeeID:req.session._id,
					date: dateToday,
					vat: 0,
					subtotal: 0,
					discount:0,
					total: 0,
					statusID: "618f650546c716a39100a809"
				};

				var purchaseID = await savePurchase(purchase)

				var poItems = [];
				for (var j=0; j<items.length; j++) {
					if (uniqueSuppliers[i] == items[j].supplier) {
						var item = {
							purchaseOrderID: purchaseID,
							itemID: await getItemID(items[j].itemDescription),
							unitID: await getUnitID(items[j].unit),
							quantity: items[j].quantity
						};
						poItems.push(item);
					}
				}

				db.insertMany(PurchasedItems, poItems, function(flag) {
					if (flag) { }
				});
			}
			res.sendStatus(200)
			//res.redirect('/purchaseOrderList');
		}
		//------END OF FUNCTIONS-------


		var purchaseItems = JSON.parse(req.body.purchaseString);
		var dateToday = new Date();

		savePO(dateToday, purchaseItems);
	},

	editPO: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login')

		else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
			async function getItems(purchaseInfo, statusID) {
				var items  = await getCurrentPOItems(purchaseInfo._id);
				for (var i=0; i<items.length; i++) {
					items[i].itemDescription = await getItemDescription(items[i].itemID);
					items[i].unitName = await getSpecificUnit(items[i].unitID);
				}
				var supplier = await getSpecificSupplier(purchaseInfo.supplierID);

				var units = await getUnits();
				var itemCategories = await getItemCategories();

				if (statusID == "618f650546c716a39100a809") {
					var newPO = statusID;
					//renders delete button and probably cancel PO button
					//res.render('editPO', {items, purchaseInfo, supplier, units, itemCategories,newPO});

					if(req.session.position == "Inventory and Purchasing"){
						var inventoryAndPurchasing = req.session.position;
						res.render('editPO', {items, purchaseInfo, supplier, units, itemCategories,newPO, inventoryAndPurchasing});	
					}
		
					if(req.session.position == "Manager"){
						var manager = req.session.position;
						res.render('editPO', {items, purchaseInfo, supplier, units, itemCategories,newPO, manager});
					}
				}
				else if (statusID == "618f652746c716a39100a80a") {
					var released = statusID;
					//renders input for price 
					//res.render('editPO', {items, purchaseInfo, supplier, units, itemCategories, released})

					if(req.session.position == "Inventory and Purchasing"){
						var inventoryAndPurchasing = req.session.position;
						res.render('editPO', {items, purchaseInfo, supplier, units, itemCategories, released, inventoryAndPurchasing});	
					}
		
					if(req.session.position == "Manager"){
						var manager = req.session.position;
						res.render('editPO', {items, purchaseInfo, supplier, units, itemCategories, released, manager});
					}
				}
			
			}

			db.findOne(Purchases, {_id:req.params.poID}, '_id purchaseOrderNumber supplierID date statusID', function(result) {
				getItems(result, result.statusID)
			})
		}
	},

	getSupplierName: function(req, res) {
		db.findMany (Suppliers, {informationStatusID:"618a7830c8067bf46fbfd4e4", name:{$regex:req.query.query, $options:'i'}}, 'name', function(result){
			var formattedResults = [];
			//reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
			for (var i=0; i<result.length; i++) {
				var formattedResult = {
					label: result[i].name,
					value: result[i].name
				};
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults)
		})
	},

	getSupplierInformation: function(req, res) {
		db.findOne(Suppliers, {name:req.query.supplierName, informationStatusID:"618a7830c8067bf46fbfd4e4"}, '', function(result) {
			res.send(result)
		})
	},

	isSold: function(req, res) {
		async function check() {
			var itemID = await getItemID (req.query.itemDesc);
			var unitID = await getUnitID(req.query.unit)
			var supplierID = await getSupplierID(req.query.supplierName)


			db.findOne (ItemSuppliers, {itemID:itemID, unitID:unitID, supplierID:supplierID}, '_id', function(result) {
				if (result == null)
					res.send("not sold")
				else
					res.send("sold")
			})
		}

		check();
	},

	//update function for new PO, add new items, delete items
	updatePOItems: function(req, res) {

		function deleteItems(poID) {
			db.deleteMany(PurchasedItems, {purchaseOrderID:poID}, function(result) {

			})
		}

		async function updatePO(items, poID) {
			deleteItems (poID)
			for (var i=0; i<items.length; i++) {
				items[i].purchaseOrderID = poID
				items[i].itemID = await getItemID(items[i].itemDesc)
				items[i].unitID = await getUnitID(items[i].unit)
			}
			db.insertMany(PurchasedItems, items, function(flag) {
				if (flag)
					res.sendStatus(200)
			})

			var supplierID = await getSupplierID(req.body.supplierName)
			db.updateOne(Purchases, {_id:poID}, {supplierID:supplierID}, function(flag) {

			})
		}

		var items = JSON.parse(req.body.itemsString);
		var poID = req.body.poID;
		updatePO(items, poID);
	},

	updatePOStatus: function(req, res) {
		db.updateOne(Purchases, {_id:req.body.poID}, {statusID:"618f652746c716a39100a80a"},function(flag) {
			if (flag) {
				res.sendStatus(200)
			}
		})
	},

	//update function for sent PO, update with prices and quantity received
	updatePOWithPrice: function(req, res) {

		function updatePOItemInfo (poID, item) {
			var itemID = item.itemID.toString()

			db.updateOne (PurchasedItems, {purchaseOrderID:poID, itemID:itemID}, {$set: {unitPrice:item.price, amount:item.amount, quantityReceived: item.quantityReceived}}, function(flag) {
				if (flag) { }
			})
		}

		//----FUNCTIONS FOR UPDATE INVENTORY QUANTITY

		function getReorderLevel (itemID) {
			return new Promise((resolve, reject) => {
				db.findOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'reorderLevel', function(result) {
					resolve(result.reorderLevel);
				})
			})
		}

		function updateQuantity(itemID, newQuantity) {
			return new Promise((resolve, reject) => {
				var quantity = parseFloat(newQuantity)
				db.updateOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, {$set:{quantityAvailable:quantity}}, function(flag) {

				})
			})
		}

		function updateQuantityInStock(itemID, newQuantity) {
			return new Promise((resolve, reject) => {
				var quantity = parseFloat(newQuantity)
				db.updateOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, {$set:{quantityAvailable:quantity, statusID:"618b6c82a07cb824ce7bfca2"}}, function(flag) {

				})
			})
		}

		async function updateInventory(poItem) {
			console.log("update inventoryItem")
			poItem.unitID = await getUnitID(poItem.unit)
			var inventoryItem = await getSpecificInventoryItems(poItem.itemID)
			console.log(poItem.unitID != inventoryItem.unitID)

			//needs conversion
			if (poItem.unitID != inventoryItem.unitID){
				console.log("conversion")
				var newQuantity = parseFloat(poItem.quantityReceived) / inventoryItem.retailQuantity;
				newQuantity = parseFloat(inventoryItem.quantityAvailable) + parseFloat(newQuantity)
			}
			
			else
				var newQuantity = parseFloat(inventoryItem.quantityAvailable) + parseFloat (poItem.quantityReceived)

			console.log("new quantity " + newQuantity)
			
			//item is still low in stock
			if (inventoryItem.reorderLevel >= newQuantity)
				updateQuantity (poItem.itemID, newQuantity)
			else
				updateQuantityInStock(poItem.itemID, newQuantity)
		}
		//------END OF FUNCTIONS FOR UPDATING INVENTORY QUANTITY------


		//------NEED NEW PO FUNCTIONS-------

		function getPOSupplier(poID) {
			return new Promise((resolve, reject) => {
				db.findOne(Purchases, {_id:poID}, 'supplierID', function(result) {
					resolve(result.supplierID);
				})
			})
		}

		async function newPO (supplierID, poNumber) {
			return new Promise((resolve, reject) => {
				var purchase = {
					purchaseOrderNumber: poNumber,
					supplierID: supplierID,
					employeeID: req.session._id,
					date: new Date(),
					statusID: "618f650546c716a39100a809",
					total: 0
				}
				db.insertOneResult(Purchases, purchase, function(result) {
					resolve(result._id)
				})
			})
		}

		//------END OF NEED NEW PO FUNCTION------

		async function updatePO(items, poID) {
			var temp_newPOItems = []
			var currentPOItems = await getCurrentPOItems(poID);


			for (var i=0; i<currentPOItems.length; i++) {
				if (items[i].price!="" && items[i].quantity!="") {
					items[i].itemID = await getItemID(items[i].itemDesc)
					items[i].unitID = await getUnitID(items[i].unit)
					//update po price and quantity received
					updatePOItemInfo(poID, items[i]);
					//add quantity to inventory
					updateInventory (items[i]);
				}

				//quantity received is less that ordered quantity
				if (req.body.needNewPo == true) {
					var newPOItem = {
						itemID: await getItemID(items[i].itemDesc),
						unitID: await getItemUnit(items[i].itemDesc),
						quantity: currentPOItems[i].quantity - items[i].quantityReceived
					}
					temp_newPOItems.push(newPOItem)
				}
			}

			if (req.body.needNewPo == true)  {
				//status is incomplete
				db.updateOne(Purchases, {_id: poID}, {statusID: "618f653746c716a39100a80b"}, function (flag) {
				})
	
				var supplierID = await getPOSupplier(poID) 
				var poNumber = await getPONumber()
				var newPOID = await newPO (supplierID, poNumber)
				var newPOItems = []

				for (var i=0; i<temp_newPOItems.length; i++) {
					var newPOItem = {
						purchaseOrderID: newPOID,
						itemID: temp_newPOItems[i].itemID,
						unitID: temp_newPOItems[i].unitID,
						quantity: temp_newPOItems[i].quantity
					}
					newPOItems.push(newPOItem)
				}

				db.insertMany(PurchasedItems, newPOItems, function(flag) {
					if (flag) 
						res.sendStatus(200)
				})
			}
			else {
				//status is received
				db.updateOne(Purchases, {_id: poID}, {statusID: "618f654646c716a39100a80c"}, function (flag) {
				})

				res.sendStatus(200)
			}
		}

		//-------END OF FUNCTIONS-------
		
		var items = JSON.parse(req.body.itemsString);
		var poID = req.body.poID;
		var subtotal = parseFloat(req.body.subtotal);
		var vat  = parseFloat(req.body.vat);
		var total = parseFloat(req.body.total);
		var discount = parseFloat(req.body.discount);
		var dateReceived = new Date();

		db.updateOne(Purchases, {_id:poID}, {$set: {dateReceived: dateReceived, subtotal:subtotal, vat: vat, total:total, discount:discount}}, function(flag) {
				updatePO(items, poID);
		})
	},

	getItemSuppliers: function(req, res) {

		function getItemSuppliersWithUnit(itemID, unitID) {
			return new Promise((resolve, reject) => {
				db.findMany(ItemSuppliers, {itemID:itemID, unitID:unitID}, '', function(result) {
					resolve(result);
				})
			})
		}

		async function getSuppliers() {
			var itemID = await getItemID(req.query.itemDesc)
			var unitID = await getUnitID(req.query.unit)
			var temp_suppliers = await getItemSuppliersWithUnit(itemID, unitID)
			
			var suppliers = []		
			for (var i=0; i<temp_suppliers.length; i++) {
				var supplier = {
					id:temp_suppliers[i].supplierID,
					name: await getSupplierName(temp_suppliers[i].supplierID)
				}
				suppliers.push(supplier);
			}
			res.send(suppliers);
		}

		getSuppliers()
	},

	deletePO: function(req, res) {
		db.updateOne(Purchases, {_id: req.body.poID}, {statusID:"61a632b4f6780b76e175421f"}, function(flag) {
			if (flag) {
				res.sendStatus(200);
			}
		})
	},

	cancelPO: function(req, res) {
		db.updateOne(Purchases, {_id: req.body.poID}, {statusID:"618f654d46c716a39100a80d"}, function(flag) {
			if (flag) {
				res.sendStatus(200);
			}
		})
	},

	generateDocument: function(req, res) {

		var supplierInfo = JSON.parse(req.query.supplierString);
		var items = JSON.parse(req.query.poItemsString);

		var fsupplierName;

		for (var i=0; i<supplierInfo.name.length; i++)
			fsupplierName = supplierInfo.name.replace(" ", "_");

		var temp_fDate0 = req.query.date.split(",");;
		var temp_fDate = temp_fDate0[0].split("/")
		var fDate = "";	
		for (var i=0; i<temp_fDate.length; i++)
			fDate += temp_fDate[i] + "_";


		var fileName = fDate + fsupplierName + '.docx';

		//for creating purchase order in docx
		// Load the docx file as binary content
		const content = fs.readFileSync(
		    path.resolve("files", "po_template.docx"), "binary"
		);

		const zip = new PizZip(content);
		
		const doc = new Docxtemplater(zip, {
		    paragraphLoop: true,
		    linebreaks: true,
		});

		// render the document
		doc.render({
			poNumber: req.query.poNumber,
			date: temp_fDate0[0],
		   	supplier_name: supplierInfo.name,
		    contact_person: supplierInfo.contactPerson,
		    address: supplierInfo.address,
		    contact_number: supplierInfo.number,
		    items:items
		});

		const buf = doc.getZip().generate({ type: "nodebuffer" });

		if (!fs.existsSync(path.resolve('documents')))
			fs.mkdirSync('documents');

		fs.writeFileSync(path.resolve("documents", fileName), buf);

		res.send(fileName)

	},

	getItemUnitsPO: function(req, res) {
		 async function getInfo() {
            var itemID = await getItemID(req.query.itemDesc)
            var supplierID = await getSupplierID(req.query.supplierName);
            var temp_itemUnits = await getSupplierItemsUnits(itemID, supplierID)
            var itemUnits = [];

            var item = await getSpecificInventoryItems(itemID);
            var itemUnit = {
            	id: item.unitID,
            	unit: await getSpecificUnit(item.unitID)
            }
            itemUnits.push(itemUnit);

            for (var i=0; i<temp_itemUnits.length; i++) {
            	if (temp_itemUnits[i].unitID != itemUnits[0].id)
                {
                	var itemUnit = {
                        id: temp_itemUnits[i].unitID,
                        unit: await getSpecificUnit(temp_itemUnits[i].unitID)
                    }
                    itemUnits.push(itemUnit);
                }
            }

            //console.log(itemUnits);
            res.send(itemUnits);
        }
        getInfo();
	}
}

module.exports = purchaseOrderController;