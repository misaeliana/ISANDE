// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Suppliers = require('../models/SuppliersModel.js');

const Items = require('../models/ItemsModel.js');

const Purchases = require('../models/PurchasesModel.js');

const ItemSuppliers = require('../models/ItemSuppliersModel.js');

const Units = require('../models/UnitsModel.js');

require('../controllers/helpers.js')();

const supplierController = {

	getSupplierList: function(req, res) {
		//if(req.session.position != "Inventory and Purchasing" || req.session.position != "Manager"){
			//res.redirect('/dashboard');
		//}
		//else{
			db.findMany(Suppliers, {informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name contactPerson number email address', function (result) {
				var suppliers = [];
				for (var i=0; i<result.length; i++) {
					var supplier = {
						supplierID: result[i]._id,
						name: result[i].name,
						contactPerson : result[i].contactPerson,
						number: result[i].number,
						email: result[i].email,
						address: result[i].address
						
					};
					suppliers.push(supplier);
				}
				//sort function 
				// if return value is > 0 sort b before a
				// if reutrn value is < 0 sort a before b
				suppliers.sort(function(a, b) {
					var textA = a.name.toUpperCase();
					var textB = b.name.toUpperCase();
					//syntax is "condition ? value if true : value if false"
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				res.render('supplierList', {suppliers});	


				/*if(req.session.position == "Inventory and Purchasing"){
					var inventoryAndPurchasing = req.session.position;
					res.render('supplierList', {suppliers, inventoryAndPurchasing});	
				}

				if(req.session.position == "Manager"){
					var manager = req.session.position;
					res.render('supplierList', {suppliers, manager});
				}*/
			});
		//}
	},

	postSupplierInformation: function(req, res) {

		var supplier

		if (req.body.number2 == "" && req.body.email == "") {
			supplier = {
				name: req.body.name,
	            contactPerson: req.body.contactPerson,
				number: req.body.number,
				address: req.body.address,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			};
		}
		else if (req.body.number2 == "" && req.body.email != "") {
			supplier = {
				name: req.body.name,
	            contactPerson: req.body.contactPerson,
				number: req.body.number,
	            email: req.body.email,
				address: req.body.address,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			};
		}
		else if (req.body.number2 != "" && req.body.email == "") {
			supplier = {
				name: req.body.name,
	            contactPerson: req.body.contactPerson,
				number: req.body.number,
	            number2: req.body.number2,
				address: req.body.address,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			};
		}
		else {
			supplier = {
				name: req.body.name,
	            contactPerson: req.body.contactPerson,
				number: req.body.number,
				number2: req.body.number2,
	            email: req.body.email,
				address: req.body.address,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			}
		}
			
		db.insertOne (Suppliers, supplier, function(flag) {
			if (flag)
				res.sendStatus(200);
		});
	},

	checkSupplierName: function(req, res) {
		var name = req.query.name;

		db.findMany(Suppliers, {name:name, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {	
			res.send(result[0]);
		});
	},

	getViewSupplier: function(req, res) {
		//if(req.session.position != "Inventory and Purchasing" || req.session.position != "Manager"){
			//res.redirect('/dashboard');
		//}
		//else{
			function getSupplierItem(supplierID) {
				return new Promise((resolve, reject) => {
					db.findMany(ItemSuppliers, {supplierID:supplierID}, '' ,function(result) {
						resolve(result);
					});
				});
			}

			function getItem(itemID) {
				return new Promise((resolve, reject) => {
					db.findOne(Items, {_id:itemID}, '', function(result) {
						resolve(result);
					});
				});
			}

			async function getInfo() {
				var supplierInfo = await getSpecificSupplier(req.params.supplierID);
				var temp_inventory = await getSupplierItem(req.params.supplierID);

				var inventory = [];
				for (var i=0; i<temp_inventory.length; i++) {
					var item = {
						itemDescription: await getItemDescription(temp_inventory[i].itemID),
						unit: await getSpecificUnit(temp_inventory[i].unitID)
					};

					inventory.push(item);
				}

				var itemCategories = await getItemCategories();
				var units = await getUnits();

				res.render('supplierInformation', {supplierInfo, inventory, itemCategories, units});	


				/*if(req.session.position == "Inventory and Purchasing"){
					var inventoryAndPurchasing = req.session.position;
					res.render('supplierList', {supplierInfo, inventory, itemCategories, units, inventoryAndPurchasing});	
				}

				if(req.session.position == "Manager"){
					var manager = req.session.position;
					res.render('supplierList', {supplierInfo, inventory, itemCategories, units, manager});
				}*/
			}

			getInfo();
		//}
	},

	postUpdateInformation: function (req, res) {

		function updatePO(oldID, newID) {
			db.updateMany(Purchases, {supplierID:oldID}, {supplierID:newID}, function(result) {

			});
		}

		function updateItemSupplier(oldID, newID) {
			db.updateMany(ItemSuppliers, {supplierID:oldID}, {supplierID:newID}, function(result) {

			});
		}

		var supplierID = req.body.supplierID;

		db.updateOne(Suppliers, {_id:supplierID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag) {
			if (flag) { }
		});

		if (req.body.number2 == "") {
			supplier = {
				name: req.body.name,
	            contactPerson: req.body.contactPerson,
				number: req.body.number,
	            email: req.body.email,
				address: req.body.address,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			};
		}
		else {
			supplier = {
				name: req.body.name,
	            contactPerson: req.body.contactPerson,
				number: req.body.number,
				number2: req.body.number2,
	            email: req.body.email,
				address: req.body.address,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			};
		}

		db.insertOneResult(Suppliers, supplier, function(result) {
			updatePO(supplierID, result._id);
			updateItemSupplier(supplierID, result._id);
			res.send(result._id);
		});
	},

	deleteSupplier: function(req, res) {
		var supplierID = req.body.supplierID;

		db.updateOne(Suppliers, {_id: supplierID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		});

		db.deleteMany(ItemSuppliers, {supplierID:supplierID}, function(result) {

		});

		res.sendStatus(200);
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
        });
	},

	checkPendingPO: function (req, res) {

		function getPurchases (supplierID) {
			return new Promise((resolve, reject) => {
				db.findMany(Purchases, {supplierID:supplierID}, '', function(result) {
					resolve(result);
				});
			});
		}

		async function check() {
			var purchases = await getPurchases(req.query.supplierID)
			var noPending = false
			for (var i=0; i<purchases.length && !noPending; i++) {
				//po is released or new
				if (purchases[i].statusID == "618f652746c716a39100a80a" || purchases[i].statusID == "618f650546c716a39100a809")
					pending = true;
			}

			if (purchases[i-1].statusID == "618f652746c716a39100a80a")
				res.send("released");
			else if(purchases[i-1].statusID == "618f650546c716a39100a809")
				res.send("new");
			else
				res.send("can delete");
		}

		check();
	},

	deleteSupplierPO: function(req, res) {
		//update po status to deleted
		db.updateMany(Purchases, {supplierID:req.body.supplierID}, {statusID:"61a632b4f6780b76e175421f"}, function(result) {
			
		});

		db.updateOne(Suppliers, {_id: req.body.supplierID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		});

		db.deleteMany(ItemSuppliers, {supplierID:req.body.supplierID}, function(result) {

		});

		res.sendStatus(200);
	},

	editSupplierItems: function(req, res) {
		//if(req.session.position != "Inventory and Purchasing" || req.session.position != "Manager"){
			//res.redirect('/dashboard');
		//}
		//else{
			async function getInfo() {
				var temp_supplierItems = await getSupplierItems(req.params.supplierID);
				var units = await getUnits();

				var supplierItems = [];
				for (var i=0; i<temp_supplierItems.length; i++) {
					var supplierItem = {
						itemDescription: await getItemDescription(temp_supplierItems[i].itemID),
						unit: await getSpecificUnit(temp_supplierItems[i].unitID)
					};
					supplierItems.push(supplierItem);
				}
				var supplierName = await getSupplierName(req.params.supplierID);
				var supplierID = req.params.supplierID;
				res.render('editSupplierItems', {supplierItems, units, supplierID, supplierName});
			}

			getInfo();
		//}
	},

	checkForPendingPOSuppliers: function(req, res) {
		async function check() {
			var itemID = await getItemID(req.query.itemDesc);
			var unitID = await getUnitID(req.query.unit);
			var supplierID = req.query.supplierID; 

			var pos = await getSupplierPO(supplierID);
			var pending = false;
			for (var i=0; i<pos.length && !pending; i++) {
				var poItems = await getCurrentPOItems(pos[i]._id);

				for (var j=0; j<poItems.length && !pending; j++) {
					if (poItems[j].itemID == itemID && poItems[j].unitID == unitID.toString())
						pending = true;
				}
			}
			res.send(pending);
		}
		check();  
	},

	updateSupplierItems: function(req, res) {

		function deleteSupplierItems(supplierID) {
			db.deleteMany(ItemSuppliers, {supplierID:supplierID}, function(result) {
			});
		}

		async function updateItemInfo() {
			var temp_supplierItems = JSON.parse(req.body.JSONsupplierItems);

			var supplierItems = [];
			for (var i = 0; i < temp_supplierItems.length; i++) {
				var supplierItem = {
					itemID: await getItemID(temp_supplierItems[i].itemDesc),
					unitID: await getUnitID(temp_supplierItems[i].unit),
					supplierID: req.body.supplierID
				};

				supplierItems.push(supplierItem);
			}

			// delete all item suppliers with ID
			await deleteSupplierItems(req.body.supplierID);

			// save new item suppliers
			db.insertMany(ItemSuppliers, supplierItems, function (flag) {
				if (flag) { }
			});
	
			res.send({redirect: '/supplier/' + req.body.supplierID});
		}
		updateItemInfo();
	}
};

module.exports = supplierController;