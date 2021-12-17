// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Suppliers = require('../models/SuppliersModel.js');

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

		async function getInfo() {
			var supplierInfo = await getSpecificSupplier(req.params.supplierID)

			res.render('supplierInformation', {supplierInfo})
		}

		getInfo();

	},

	postUpdateInformation: function (req, res) {
		var supplierID = req.body.supplierID;

		db.updateOne(Suppliers, {_id:supplierID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag) {
			if (flag) { }
		});

		var supplier = {
		//name:req.body.name,
            contactPerson:req.body.contactPerson,
			number:req.body.number, 
            email:req.body.email,
			address:req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Suppliers, supplier, function(result) {
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

	}
};

module.exports = supplierController;