// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Customer = require('../models/CustomersModel.js');

const customerController = {

	getCustomerList: function(req, res) {
		db.findMany(Customer, {informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name number address', function (result) {
			var customers = [];
			for (var i=0; i<result.length; i++) {
					var customer = {
						customerID: result[i]._id,
						name: result[i].name,
						number: result[i].number,
						address: result[i].address
					}
					customers.push(customer);
				}
			res.render('customerList', {customers});
		})
	},

	postCustomerInformation: function(req, res) {
		var customer = {
			name: req.body.name,
			number: req.body.number,
			address: req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		}

		db.insertOne (Customer, customer, function(flag) {
			if (flag) { }
		})
	},

	checkCustomerName: function(req, res) {
		var name = req.query.name;

		db.findMany(Customer, {name:name, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {	
			res.send(result[0]);
		})
	},

	getViewCustomer: function(req, res) {
		db.findOne(Customer, {_id: req.params.customerID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name number address', function(result) {
			res.render('customerInformation', result)
		})
	},

	postUpdateInformation: function (req, res) {
		var customerID = req.body.customerID;

		db.updateOne(Customer, {_id:customerID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag) {
			if (flag) { }
		})

		var customer = {
			//name:req.body.name,
			number:req.body.number, 
			address:req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		}

		db.insertOneResult(Customer, customer, function(result) {
			res.send(result._id)
		})
	},

	deleteCustomer: function(req, res) {
		var customerID = req.body.customerID;

		db.updateOne(Customer, {_id: customerID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		})
	}
}

module.exports = customerController;