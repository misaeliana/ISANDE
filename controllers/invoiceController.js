// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceTypes = require('../models/InvoiceTypesModel.js');

const InvoiceStatus = require('../models/InvoiceStatusModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

const deliveries = require('../models/DeliveriesModel.js');

require('../controllers/helpers.js')();

const invoiceController = {
 
	getInvoiceList: function(req, res) {
       
        // var type = {
        //     type: "In-Store"
        // };

		// var invoice = {
		// 	invoiceID: "1",
		// 	customerID: "6193c28080a72f8050c2e75a",
		// 	date: "10/11/21",
		// 	typeID: "6197863ac4f0088e95c9bf84",
		// 	statusID: "619785b0d9a967328c1e8fa6",
        //     subtotal: 200,
        //     VAT: 100,
        //     discount: 0,
        //     total: 300,
        //     employeeID: "6187c88ffa9a0c35600c54a8"
        // };

        // db.insertOne (Invoices, invoice, function(flag) {
		// 	if (flag) { }
		// });
        
        // var invoiceItem = {
		// 	invoice_id: "6198924057401a04da061a72",
		// 	itemID: "61949d9d46d32db277601092",
		// 	quantity: 2,
		// 	discount: 150,
        // };

        // db.insertOne (InvoiceItems, invoiceItem, function(flag) {
		// 	if (flag) { }
        // });
        
        // var delivery = {
		// 	invoice_id: "6198924057401a04da061a72",
        //     deliveryDate: "10/12/21",
        //     dateDelivered: null,
		// 	deliveryPersonnel: "juan_cruz@gmail.com",
		// 	deliveryNotes: null,
        // };
        
        // db.insertOne (deliveries, delivery, function(flag) {
        //     	if (flag) { }
        //     });
		async function getInformation() {
            

            var invoices = await getInvoices();
            var invoicesInfo = [];

            for (var i = 0; i < invoices.length; i++) {
                var date = new Date(invoices[i].date);

                var invoiceInfo = {
                    _id: invoices[i]._id,
                    formattedDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    invoiceID: invoices[i].invoiceID,
                    customerName: await getSpecificCustomer(invoices[i].customerID),
                    total: parseFloat(invoices[i].total).toFixed(2),
                    type: await getSpecificInvoiceType(invoices[i].typeID),
                    status: await getSpecificInvoiceStatus(invoices[i].statusID)
                };

                invoicesInfo.push(invoiceInfo);
           
            }
			res.render('invoiceList', {invoicesInfo});
		}
		getInformation();
    },

    getViewSpecificInvoice: function(req, res) {

		async function getInformation() {
            var invoice_id = req.params.invoiceID;
            var invoice = await getInvoice(invoice_id);
            var date = new Date(invoice.date);
            var employee = await getEmployeeInfo(invoice.employeeID);
            var items = [];

			var invoiceInfo = {
                invoice_id: invoice_id,
                invoiceID: invoice.invoiceID,
                customerName: await getSpecificCustomer(invoice.customerID),
                date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                type: await getSpecificInvoiceType(invoice.typeID),
                status: await getSpecificInvoiceStatus(invoice.statusID),
                subtotal: parseFloat(invoice.subtotal).toFixed(2),
                VAT: parseFloat(invoice.VAT).toFixed(2),
                discount: parseFloat(invoice.discount).toFixed(2),
                total: parseFloat(invoice.total).toFixed(2),
                employeeName: employee.name
            };

            if (invoiceInfo.type == "Delivery") {
                var delivery = await getDeliveryInformation(invoice_id);

                employeeName = await getEmployeeInfo(delivery.deliveryPersonnel);

                delivery.deliveryPersonnel = employeeName.name; 

                // get customer info
                var customer = await getCustomerInfo(invoice.customerID);
            }
            
            var invoiceItems = await getInvoiceItems(invoice_id);

            for (var i = 0; i < invoiceItems.length; i++) {
                var itemInfo = await getSpecificInventoryItems(invoiceItems[i].itemID);

               var item = {
                    itemDescription: itemInfo.itemDescription,
                    qty: invoiceItems[i].quantity,
                    unit: await getSpecificUnit(itemInfo.unitID),
                    unitPrice: parseFloat(itemInfo.sellingPrice).toFixed(2),
                    discount: parseFloat(invoiceItems[i].discount).toFixed(2),
                    amount: ((parseFloat(itemInfo.sellingPrice) * parseFloat(invoiceItems[i].quantity)) - parseFloat(invoiceItems[i].discount)).toFixed(2)
                };

                items.push(item);
            }

			res.render('viewInvoice', {invoiceInfo, items, delivery, customer});
		}

		getInformation();
		
	},
    
    getFilteredRowsInvoice: function(req, res) {
        var startDate = new Date(req.query.startDate);
        var endDate = new Date(req.query.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        
        async function getInformation() {
            var invoices = await getInvoices();
            var invoicesInfo = [];
            for (var i = 0; i < invoices.length; i++) {
                var date = new Date(invoices[i].date);
                date.setHours(0,0,0,0);
                
                if (!(startDate > date || date > endDate)) {
                    var invoiceInfo = {
                        _id: invoices[i]._id,
                        formattedDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                        invoiceID: invoices[i].invoiceID,
                        customerName: await getSpecificCustomer(invoices[i].customerID),
                        total: parseFloat(invoices[i].total).toFixed(2),
                        type: await getSpecificInvoiceType(invoices[i].typeID),
                        status: await getSpecificInvoiceStatus(invoices[i].statusID)
                    };
    
                    invoicesInfo.push(invoiceInfo);
                }
            }
            res.send(invoicesInfo);
        }

        getInformation();
    },

    getSearchInvoice: function(req, res) {
        var searchItem = req.query.searchItem;
        
        async function getInformation() {
            var invoiceInfo = [];
            var info;
            var date;
            var invoice = await getSpecificInvoice(searchItem);
            var customerIDs = await getCustomerIDs(searchItem);

            if (invoice != null) {
                date = new Date(invoice.date);
                info = {
                    _id: invoice._id,
                    formattedDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    invoiceID: invoice.invoiceID,
                    customerName: await getSpecificCustomer(invoice.customerID),
                    total: parseFloat(invoice.total).toFixed(2),
                    type: await getSpecificInvoiceType(invoice.typeID),
                    status: await getSpecificInvoiceStatus(invoice.statusID)
                };
                invoiceInfo.push(info);
            }
            
            if (customerIDs != null) {
                for (var i = 0; i < customerIDs.length; i++) {
                    var customerInvoices = await getCustomerInvocies(customerIDs[i]._id);
                    //console.log("Customer invocies " + customerInvoices);
                    if (customerInvoices != null) {
                        for (var j = 0; j < customerInvoices.length; j++) {
                            date = new Date(customerInvoices[j].date);
                            info = {
                                _id: customerInvoices[j]._id,
                                formattedDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                                invoiceID: customerInvoices[j].invoiceID,
                                customerName: await getSpecificCustomer(customerInvoices[j].customerID),
                                total: parseFloat(customerInvoices[j].total).toFixed(2),
                                type: await getSpecificInvoiceType(customerInvoices[j].typeID),
                                status: await getSpecificInvoiceStatus(customerInvoices[j].statusID)
                            };
                            invoiceInfo.push(info);
                        }
                    }
                }
            }

            if (invoiceInfo.length > 0)
                res.send(invoiceInfo);
            else 
                res.send(null);
		}
        getInformation();
    },

    getNewInvoice: function(req, res) {
        
		async function getInvoiceTypes () {
			var itype = await getAllInvoiceTypes();
            res.render('newInvoice', {itype});
		}	//res.sendFile( dir+"/newInvoice.html");
        getInvoiceTypes();
    },
    
    addNewInvoice: function(req,res){
        async function saveItems(invoiceID, items) {
			for (var i=0; i<items.length; i++) {
				items[i].invoice_id = invoiceID;    
                items[i].itemID = await getItemID(items[i].itemDescription);
				items[i].quantity =  items[i].quantity;
                items[i].discount = items[i].discount;
			}

			db.insertMany(InvoiceItems, items, function(flag) {
				if (flag) {}
			});
		}
            var invoice = {
                invoiceID: 'mocke',
                customerID: req.body.custID,
                date: req.body.date,
                typeID: req.body.typeID,
                statusID:req.body.statusID,
                subtotal: req.body.subtotal,
                VAT: req.body.VAT,
                discount: req.body.discount,
                total:req.body.total,
                employeeID: "6187c88ffa9a0c35600c54a8"
            };
            var items = JSON.parse(req.body.itemString);
            var invoiceID = '';
            db.insertOneResult (Invoices, invoice, function(result) {
                invoiceID = result._id;
                //console.log("invoice added:")
                //console.log('invoiceID: ' +invoiceID);
               saveItems(invoiceID,items);
            });
    },

    getItemPrice: function(req, res) {
        db.findOne (Items, {itemDescription:req.query.itemDesc},'itemDescription sellingPrice', function (result) {
                res.send(result);
           
            //reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
        });
    },

    getDeliveryList: function(req, res) {

        async function getInformation() {
            var deliveries = await getDeliveries();
            var deliveryInfo = [];

            for (var i = 0; i < deliveries.length; i++) {
                var date = new Date(deliveries[i].deliveryDate);
                var delivery = {
                    _id: deliveries[i]._id,
                    invoice_id: deliveries[i].invoice_id,
                    invoiceNum: "invoice num",
                    customerName: "cust name",
                    paymentStatus: "paid",
                    amount: "amount", // format
                    deliveryStatus: "delivery status", // remove??
                    deliveryDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    deliveryPersonnel: deliveries[i].deliveryPersonnel
                };

                deliveryInfo.push(delivery);
            }

            res.render('deliveryList', {deliveryInfo});
        }

        getInformation();
    }
};

module.exports = invoiceController;