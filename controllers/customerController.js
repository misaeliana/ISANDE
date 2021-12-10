// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Customers = require('../models/CustomersModel.js');

const Invoices = require('../models/InvoiceModel.js')

const AccountPayments = require('../models/OnAccountPaymentModel.js')

require('../controllers/helpers.js')();

const customerController = {

	getCustomerList: function(req, res) {
		db.findMany(Customers, {informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name number address', function (result) {
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

		db.insertOne (Customers, customer, function(flag) {
			if (flag) { }
		})
	},

	checkCustomerName: function(req, res) {
		var name = req.query.name;

		db.findMany(Customers, {name:name, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {	
			res.send(result[0]);
		})
	},

	getViewCustomer: function(req, res) {

		async function getCustomerInformation() {
			var customerInfo = await getCustomerInfo(req.params.customerID)
			var temp_customerInvoices = await getCustomerInvocies(req.params.customerID)
			var customerInvoices = [] 
			for (var i=0; i<temp_customerInvoices.length; i++) {
				var temp_date = new Date(temp_customerInvoices[i].date)
				var invoice = {
					invoiceID: temp_customerInvoices[i]._id,
					date: temp_date.getMonth() + 1 + "/" + temp_date.getDate() + "/" + temp_date.getFullYear(),
					invoiceNumber: temp_customerInvoices[i].invoiceID,
					total: temp_customerInvoices[i].total,
					type: await getSpecificInvoiceType(temp_customerInvoices[i].typeID),
					status: await getSpecificInvoiceStatus(temp_customerInvoices[i].statusID)
				}
				customerInvoices.push(invoice)
			}


			var temp_unpaidInvoices = await getUnpaidInvoices(req.params.customerID);
			var unpaidInvoices = []
			for (var i=0; i<temp_unpaidInvoices.length; i++) {
				var temp_date = new Date(temp_customerInvoices[i].date)
				var total = temp_unpaidInvoices[i].total
				var amountPaid = await getAmountPaid(temp_unpaidInvoices[i]._id)
				var invoice = {
					date: temp_date.getMonth() + 1 + "/" + temp_date.getDate() + "/" + temp_date.getFullYear(),
					invoiceNumber: temp_unpaidInvoices[i].invoiceID,
					total: total,
					paid: amountPaid,
					due: total-amountPaid,
				}
				unpaidInvoices.push(invoice)
			}

			res.render('customerInformation', {customerInfo, customerInvoices, unpaidInvoices})
		}

		getCustomerInformation()
	},

	postUpdateInformation: function (req, res) {
		var customerID = req.body.customerID;

		db.updateOne(Customers, {_id:customerID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag) {
			if (flag) { }
		})

		var customer = {
			//name:req.body.name,
			number:req.body.number, 
			address:req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		}

		db.insertOneResult(Customers, customer, function(result) {
			res.send(result._id)
		})
	},

	deleteCustomer: function(req, res) {
		var customerID = req.body.customerID;

		db.updateOne(Customers, {_id: customerID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		});
	},

	payAccount: function(req, res) {

		function getPreviousAccountPayment(invoiceID) {
			return new Promise((resolve, reject) => {
				db.findMany(AccountPayments,{invoiceID:invoiceID}, 'amountPaid', function(result) {
					var totalPaid = 0
					for (var j=0; j<result.length; j++)
						totalPaid += result.amountPaid
					resolve (totalPaid)
				})
			})
		}	

		function updateInvoiceStatus(invoiceID)	{
			//update status to paid
			db.updateOne(Invoices, {_id:invoiceID}, {statusID:"619785b0d9a967328c1e8fa6"}, function(flag){
				if (flag) { }
			})
		}

		async function pay() {
			var amountPaid = req.body.amountPaid;
			var unpaidInvoices = await getUnpaidInvoices(req.body.customerID);

			for (var i=0; i<unpaidInvoices.length && amountPaid > 0; i++) {
				var invoiceTotal = await getInvoiceTotal(unpaidInvoices[i]._id)
				var prevPaidAmount = await getAmountPaid(unpaidInvoices[i]._id)

				var possiblePayable = invoiceTotal - prevPaidAmount

				//can still pay for other invoices
				if (possiblePayable <= amountPaid) {
					amountPaid -= possiblePayable
					amountPaidForInvoice = possiblePayable
					updateInvoiceStatus(unpaidInvoices[i]._id)
				}

				//amount is already exhausted for the invoice
				else {
					amountPaidForInvoice = amountPaid
					amountPaid = 0
				}

				var newPayment = {
					invoiceID: unpaidInvoices[i]._id,
					datePaid: new Date(),
					amountPaid: amountPaidForInvoice
				}

				db.insertOne(AccountPayments, newPayment, function(flag) {
				})
			}
			res.sendStatus(200)
		}

		pay()
	}
}

module.exports = customerController;