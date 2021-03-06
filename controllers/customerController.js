// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Customers = require('../models/CustomersModel.js');

const CustomerAddresses = require('../models/CustomerAddressModel.js');

const Invoices = require('../models/InvoiceModel.js');

const AccountPayments = require('../models/OnAccountPaymentModel.js');


require('../controllers/helpers.js')();

const customerController = {

	getCustomerList: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login')

		else if(req.session.position != "Sales" && req.session.position != "Manager"){
            res.redirect('/dashboard');
        }
        else{
			db.findMany(Customers, {informationStatusID:"618a7830c8067bf46fbfd4e4"}, '', function (result) {
				var customers = [];
				for (var i=0; i<result.length; i++) {
					var customer = {
						customerID: result[i]._id,
						contactPerson: result[i].contactPerson,
						name: result[i].name,
						number: result[i].number,
						//address: result[i].address
					};
					customers.push(customer);
				}
				//sort function 
				// if return value is > 0 sort b before a
				// if reutrn value is < 0 sort a before b
				customers.sort(function(a, b) {
					var textA = a.name.toUpperCase();
					var textB = b.name.toUpperCase();
					//syntax is "condition ? value if true : value if false"
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

					//res.render('customerList', {customers});	


				if(req.session.position == "Sales"){
					var cashier = req.session.position;
					res.render('customerList', {customers, cashier});	
				}

				if(req.session.position == "Manager"){
					var manager = req.session.position;
					res.render('customerList', {customers, manager});
				}
			});
		}
	},

	postCustomerInformation: function(req, res) {
		var customer = {
			name: req.body.name,
			contactPerson: req.body.contactPerson,
			number: req.body.number,
			//address: req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		var addressTitle = JSON.parse(req.body.titleStr)
		var address = JSON.parse(req.body.addressStr) 
		
		db.insertOneResult (Customers, customer, function(result) {

			for (var i=0; i<address.length; i++) {
				var customerAddress = {
					customerID: result._id,
					addressTitle: addressTitle[i],
					address: address[i],
					informationStatusID: "618a7830c8067bf46fbfd4e4"
				}
				db.insertOne(CustomerAddresses, customerAddress, function(flag) {

				})
			}

			res.sendStatus(200) 
		});
	},

	checkCustomerName: function(req, res) {
		var name = req.query.name;

		db.findMany(Customers, {name:name, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {	
			res.send(result[0]);
		});
	},

	getViewCustomer: function(req, res) {
		if (req.session.position == null)
			res.redirect('/login')

		else if(req.session.position != "Sales" && req.session.position != "Manager"){
            res.redirect('/dashboard');
        }
        else{
			async function getCustomerInformation() {
				var customerInfo = await getCustomerInfo(req.params.customerID);
				var temp_customerInvoices = await getCustomerInvoices(req.params.customerID);
				var customerInvoices = [] ;
				for (var i=0; i<temp_customerInvoices.length; i++) {
					var temp_date = new Date(temp_customerInvoices[i].date);
					var invoice = {
						invoiceID: temp_customerInvoices[i]._id,
						date: temp_date.getMonth() + 1 + "/" + temp_date.getDate() + "/" + temp_date.getFullYear(),
						invoiceNumber: temp_customerInvoices[i].invoiceID,
						total: numberWithCommas(parseFloat(temp_customerInvoices[i].total).toFixed(2)),
						type: await getSpecificInvoiceType(temp_customerInvoices[i].typeID),
						status: await getSpecificInvoiceStatus(temp_customerInvoices[i].statusID)
					};
					customerInvoices.push(invoice);
				}

				var customerAddress = await getCustomerAddresses(req.params.customerID)
				var paymentMethods = await getOnAccountPaymentMethods();


				var temp_unpaidInvoices = await getUnpaidInvoices(req.params.customerID);
				var unpaidInvoices = [];
				var totalAmountDue = 0;
				for (var i=0; i<temp_unpaidInvoices.length; i++) {
					var temp_date = new Date(temp_unpaidInvoices[i].date);
					var total = temp_unpaidInvoices[i].total;
					var amountPaid = await getAmountPaid(temp_unpaidInvoices[i]._id);
					var due = total - amountPaid
					var invoice = {
						invoiceID: temp_unpaidInvoices[i]._id,
						date: temp_date.getMonth() + 1 + "/" + temp_date.getDate() + "/" + temp_date.getFullYear(),
						invoiceNumber: temp_unpaidInvoices[i].invoiceID,
						total: numberWithCommas(parseFloat(total).toFixed(2)),
						paid: numberWithCommas(parseFloat(amountPaid).toFixed(2)),
						due: numberWithCommas(parseFloat(due).toFixed(2)),
					};

					totalAmountDue += parseFloat(due);
					unpaidInvoices.push(invoice);
				}
				totalAmountDue = numberWithCommas(parseFloat(totalAmountDue).toFixed(2));

				var paymentMethods = await getOnAccountPaymentMethods();

				if (unpaidInvoices.length==0) {
					if(req.session.position == "Sales"){
						var cashier = req.session.position;
						res.render('customerInformation', {customerInfo, customerAddress, customerInvoices, totalAmountDue, cashier});
					}
		
					if(req.session.position == "Manager"){
						var manager = req.session.position;
						res.render('customerInformation', {customerInfo, customerAddress, customerInvoices, totalAmountDue, manager});
					}
					//res.render('customerInformation', {customerInfo, customerAddress, customerInvoices, totalAmountDue})
				}
				else {
					if(req.session.position == "Sales"){
						var cashier = req.session.position;
						res.render('customerInformation', {customerInfo, customerAddress, customerInvoices, unpaidInvoices, paymentMethods, totalAmountDue, cashier});
					}
		
					if(req.session.position == "Manager"){
						var manager = req.session.position;
						res.render('customerInformation', {customerInfo, customerAddress, customerInvoices, unpaidInvoices, paymentMethods, totalAmountDue, manager});
					}
					//res.render('customerInformation', {customerInfo, customerAddress, customerInvoices, unpaidInvoices, paymentMethods, totalAmountDue});

				}
			}

			getCustomerInformation();
		}
	},

	postUpdateInformation: function (req, res) {

		function updateInvoices(oldID, newID) {
			db.updateMany(Invoices, {customerID:oldID}, {customerID:newID}, function(result) {

			});
		}	

		var customerID = req.body.customerID;

		db.updateOne(Customers, {_id:customerID}, {informationStatusID:"618a783cc8067bf46fbfd4e5"}, function(flag) {
			if (flag) { }
		});

		db.updateMany(CustomerAddresses, {customerID:customerID}, {informationStatusID:"618a783cc8067bf46fbfd4e5"}, function(flag) {
			if (flag) {}
		});

		var addressTitle = JSON.parse(req.body.titleStr)
		var address = JSON.parse(req.body.addressStr) 

		var customer = {
			name:req.body.name,
			contactPerson: req.body.contactPerson,
			number:req.body.number, 
			//address:req.body.address,
			informationStatusID: "618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Customers, customer, function(result) {
			for (var i=0; i<address.length; i++) {
				var customerAddress = {
					customerID: result._id,
					addressTitle: addressTitle[i],
					address: address[i],
					informationStatusID: "618a7830c8067bf46fbfd4e4"
				}
				db.insertOne(CustomerAddresses, customerAddress, function(flag) {

				})
			}
			updateInvoices(customerID, result._id);
			res.send(result._id);
		});
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
					var totalPaid = 0;
					for (var j=0; j<result.length; j++)
						totalPaid += result.amountPaid;
					resolve (totalPaid);
				});
			});
		}	

		function updateInvoiceStatus(invoiceID)	{
			//update status to paid
			db.updateOne(Invoices, {_id:invoiceID}, {statusID:"619785b0d9a967328c1e8fa6"}, function(flag){
				if (flag) { }
			});
		}

		async function pay() {
			var amountPaid = req.body.amountPaid;
			var unpaidInvoices = await getUnpaidInvoices(req.body.customerID);

			for (var i=0; i<unpaidInvoices.length && amountPaid > 0; i++) {
				var invoiceTotal = await getInvoiceTotal(unpaidInvoices[i]._id);
				var prevPaidAmount = await getAmountPaid(unpaidInvoices[i]._id);

				var possiblePayable = invoiceTotal - prevPaidAmount;

				//can still pay for other invoices
				if (possiblePayable <= amountPaid) {
					amountPaid -= possiblePayable;
					amountPaidForInvoice = possiblePayable;
					updateInvoiceStatus(unpaidInvoices[i]._id);
				}

				//amount is already exhausted for the invoice
				else {
					amountPaidForInvoice = amountPaid;
					amountPaid = 0;
				}

				var newPayment = {
					invoiceID: unpaidInvoices[i]._id,
					datePaid: new Date(),
					paymentMethod: req.body.paymentMethod,
					//paymentDetails: req.body.paymentDetails,
					amountPaid: amountPaidForInvoice
				};

				if (req.body.paymentDetails!="")
					newPayment.paymentDetails = req.body.paymentDetails

				db.insertOne(AccountPayments, newPayment, function(flag) {
				});
			}
			res.sendStatus(200);
		}

		pay();
	},

	checkPendingInvoices: function (req, res) {

		async function check() {
			var invoices = await getCustomerInvocies(req.query.customerID)
			var pending = false;

			for (var i=0; i<invoices.length && !pending; i++) {
				//status is pending or partial
				if (invoices[i].statusID == "619785d78094faf8c10d1484" || invoices[i].statusID == "61b2df709f9cd4edddf21d68")
					pending = true;
			}

			if (pending)
				res.send(true);
			else
				res.send(false);
		}


		check();
	}
};

module.exports = customerController;