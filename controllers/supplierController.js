// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Suppliers = require('../models/SuppliersModel.js');

const Items = require('../models/ItemsModel.js')

const Purchases = require('../models/PurchasesModel.js');

const ItemSuppliers = require('../models/ItemSuppliersModel.js')

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
			res.render('supplierList', {suppliers});
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
				res.sendStatus(200)
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
					resolve(result)
				})
			})
		}

		function getItem(itemID) {
			return new Promise((resolve, reject) => {
				db.findOne(Items, {_id:itemID}, '', function(result) {
					resolve(result)
				})
			})
		}

		async function getInfo() {
			var supplierInfo = await getSpecificSupplier(req.params.supplierID);
			var temp_inventory = await getSupplierItem(req.params.supplierID);

			var inventory = []
			for (var i=0; i<temp_inventory.length; i++) {
				var itemInfo = await getItem(temp_inventory[i].itemID)
				var item = {
					itemDescription: itemInfo.itemDescription,
					unit: await getSpecificUnit(itemInfo.unitID)
				}
				inventory.push(item)
			}

			var itemCategories = await getItemCategories()
			var units = await getUnits()

			res.render('supplierInformation', {supplierInfo, inventory, itemCategories, units})
		}

		getInfo();

	},

	postUpdateInformation: function (req, res) {

		function updatePO(oldID, newID) {
			db.updateMany(Purchases, {supplierID:oldID}, {supplierID:newID}, function(result) {

			})
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
			res.send(result._id);
		});
	},

	deleteSupplier: function(req, res) {
		var supplierID = req.body.supplierID;

		db.updateOne(Suppliers, {_id: supplierID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		});
	},

	addSupplierItem: function(req, res) {

		function insert(itemSupplier) {
			db.insertOne(ItemSuppliers, itemSupplier, function(flag) {

			})
		}

		async function addInfo() {
			var itemSupplier = {
				itemID: await getItemID(req.body.itemDesc),
				supplierID: req.body.supplierID
			}

			insert(itemSupplier)

			var unitID = await getItemUnitItemID(itemSupplier.itemID)
			var unitName = await getSpecificUnit(unitID)

			res.send(unitName)
		}

		addInfo()
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
            res.send(formattedResults)
        })
	}
};

module.exports = supplierController;