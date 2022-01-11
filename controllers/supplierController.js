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
	},

	postSupplierInformation: function(req, res) {
		var supplier = {
			name: req.body.name,
            contactPerson: req.body.contactPerson,
			number: req.body.number,
            email: req.body.email,
			address: req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

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
				}
				inventory.push(item)
				var itemInfo = await getItem(temp_inventory[i].itemID);
				var item = {
					itemDescription: itemInfo.itemDescription,
					unit: await getSpecificUnit(itemInfo.unitID)
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

		var supplier = {
			name:req.body.name,
            contactPerson:req.body.contactPerson,
			number:req.body.number, 
            email:req.body.email,
			address:req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Suppliers, supplier, function(result) {
			updatePO(supplierID, result._id)
			updateItemSupplier(supplierID, result._id)
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

	addSupplierItem: function(req, res) {

		function insert(itemSupplier) {
			db.insertOne(ItemSuppliers, itemSupplier, function(flag) {

			});
		}

		async function addInfo() {
			var itemSupplier = {
				itemID: await getItemID(req.body.itemDesc),
				unitID: req.body.unitID, 
				supplierID: req.body.supplierID
			};

			insert(itemSupplier);
      
			res.sendStatus(200)
		}

		addInfo();
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
	}
};

module.exports = supplierController;