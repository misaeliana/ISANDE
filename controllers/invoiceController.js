// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceTypes = require('../models/InvoiceTypesModel.js');

const InvoiceStatus = require('../models/InvoiceStatusModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

const deliveries = require('../models/DeliveriesModel.js');

const Customer = require('../models/CustomersModel.js');

const ReturnReasons = require('../models/ReturnReasonsModel.js');

const Shrinkages = require('../models/ShrinkagesModel.js');

const ShrinkagesReasons = require('../models/ShrinkageReasonsModel.js');

const PaymentOptions = require('../models/PaymentOptionModel.js');

const AccountPayments = require('../models/OnAccountPaymentModel.js')   

require('../controllers/helpers.js')();

const fs = require('fs');

const PizZip = require("pizzip");

const Docxtemplater = require("docxtemplater");


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

        function getPaymentHistory(invoiceID) {
            return new Promise((resolve, reject) => {
                db.findMany(AccountPayments, {invoiceID:invoiceID}, 'datePaid amountPaid', function(result) {
                    resolve (result);
                });
            });
        }

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
                paymentOption: await getSpecificPaymentType(invoice.paymentOptionID),
                status: await getSpecificInvoiceStatus(invoice.statusID),
                subtotal: parseFloat(invoice.subtotal).toFixed(2),
                VAT: parseFloat(invoice.VAT).toFixed(2),
                discount: parseFloat(invoice.discount).toFixed(2),
                total: parseFloat(invoice.total).toFixed(2),
                employeeName: employee.name
            };

            var delivery;

            if (invoiceInfo.type == "Delivery") {
                delivery = await getDeliveryInformation(invoice_id);

                employeeName = await getEmployeeInfo(delivery.deliveryPersonnel);

                delivery.deliveryPersonnel = employeeName.name; 

                var deliveryDate = new Date(delivery.deliveryDate);
                delivery.fdeliveryDate = deliveryDate.getMonth() + 1 + "/" + deliveryDate.getDate() + "/" + deliveryDate.getFullYear(); 

                if (delivery.dateDelivered != undefined ) {
                    var dateDelivered = new Date(delivery.dateDelivered);
                    delivery.fdateDelivered = dateDelivered.getMonth() + 1 + "/" + dateDelivered.getDate() + "/" + dateDelivered.getFullYear(); 
                }         

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


            if (invoiceInfo.status == "Pending" || invoiceInfo.status == "Partial" || invoiceInfo.paymentOption == "On Account") {
                var pending = true
                var onAccount = true
                var temp_paymentHistory = await getPaymentHistory(invoice_id)
                var paymentTotal = 0
                var paymentHistory = []
                for (var i=0; i<temp_paymentHistory.length; i++) {
                    var temp_date = new Date(temp_paymentHistory[i].datePaid)
                    var payment = {
                        date: temp_date.getMonth() + 1 + "/" + temp_date.getDate() + "/" + temp_date.getFullYear(),
                        amountPaid: temp_paymentHistory[i].amountPaid
                    }
                    paymentTotal += temp_paymentHistory[i].amountPaid
                    paymentHistory.push(payment)
                }
                var amountDue = invoiceInfo.total - paymentTotal

                if (invoiceInfo.paymentOption == "On Account")
                {
                    if (invoiceInfo.status == "Paid") {
                        var paid = true
                        if (delivery != "")
                            res.render('viewInvoice', {invoiceInfo, items, delivery, paid, onAccount, paymentHistory, paymentTotal, amountDue});
                        else
                            res.render('viewInvoice', {invoiceInfo, items, paid, onAccount, paymentHistory, paymentTotal, amountDue});

                    }
                    else {
                        if (delivery != "")
                            res.render('viewInvoice', {invoiceInfo, items, delivery, pending, onAccount, paymentHistory, paymentTotal, amountDue});
                        else
                            res.render('viewInvoice', {invoiceInfo, items, pending, onAccount, paymentHistory, paymentTotal, amountDue});
                    }
                }
                else {
                    if (delivery != "")
                            res.render('viewInvoice', {invoiceInfo, items, delivery,  paymentHistory, paymentTotal, amountDue});
                    else
                        res.render('viewInvoice', {invoiceInfo, items, paymentHistory, paymentTotal, amountDue});
                }
            }
            else {
                if (delivery != "")
                            res.render('viewInvoice', {invoiceInfo, items, delivery});
                        else
                            res.render('viewInvoice', {invoiceInfo, items});
            }
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
                    var customerInvoices = await getCustomerInvoices(customerIDs[i]._id);
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
            var delperson = await getDeliveryPersonnel();
            var paymentTypes = await getPaymentOptions()
            res.render('newInvoice', {itype,delperson, paymentTypes});
		}	//res.sendFile( dir+"/newInvoice.html");
        getInvoiceTypes();
    },
    
    addNewInvoice: function(req,res){

        function deductInventory(item) {
            db.findOne(Items, {itemDescription:item.itemDescription}, 'quantityAvailable', function(result) {
                var updatedQuantity = parseInt(result.quantityAvailable) - parseInt(item.quantity)
                db.updateOne(Items, {itemDescription:item.itemDescription}, {quantityAvailable: updatedQuantity}, function(result) {
                    //update item info to out of stock
                    if (updatedQuantity == 0) {
                        db.updateOne(Items, {itemDescription:item.itemDescription}, {statusID:"61b0d6751ca91f5969f166de"}, function(result) {

                        })
                    }
                })
            })
        }

        async function saveItems(invoiceID, items) {
			for (var i=0; i<items.length; i++) {
				items[i].invoice_id = invoiceID;
                items[i].itemID = await getItemID(items[i].itemDescription);
				items[i].quantity =  items[i].quantity;
                items[i].discount = items[i].discount;
                deductInventory(items[i])
			}
			db.insertMany(InvoiceItems, items, function(flag) {
                if (flag)
                    res.sendStatus(200)
            });
		}


        async function saveInvoice() {
            var invoiceNo = await getInvoiceNumber();
            var custID = await getCustomerID(req.body.custName);
             var invoice = {
                invoiceID: invoiceNo,
                customerID: custID,
                date: req.body.date,
                typeID: req.body.typeID,
                statusID:req.body.statusID,
                paymentOptionID: req.body.paymentOption,
                subtotal: parseFloat(req.body.subtotal),
                VAT: parseFloat(req.body.VAT),
                discount: parseFloat(req.body.discount),
                total:parseFloat(req.body.total),
                employeeID: "61bc3ecb39b4c1027aaac14d"
            };
            var items = JSON.parse(req.body.itemString);
            db.insertOneResult (Invoices, invoice, function(result) {
                var invoiceID = result._id;
                if(req.body.typeID == '61a591c1233fa7f9abcd5726'){
                    var dpackage = {
                        invoice_id: invoiceID,
                        deliveryDate: req.body.ddate,
                        dateDelivered: null,
                        deliveryPersonnel: req.body.employeeID,
                        deliveryNotes: req.body.dnotes
                    }
                    db.insertOne(deliveries, dpackage, function(flag) {if (flag) {}});
                    console.log("delivery invoice added:");
                }
                saveItems(invoiceID,items);
                //console.log("invoice added:")
                //console.log('invoiceID: ' +invoiceID);
            });
        }
        saveInvoice();
    },

    getItemPrice: function(req, res) {
        db.findOne (Items, {itemDescription:req.query.itemDesc},'itemDescription sellingPrice quantityAvailable', function (result) {
                res.send(result);
           
            //reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
        });
    },

    addNewCustomer: function(req,res){
        var newCustomer = {
            name: req.body.custname,
            number: req.body.custphone,
            address: req.body.custaddress,
            informationStatusID: '618a7830c8067bf46fbfd4e4'
        }
        db.insertOne(Customer, newCustomer, function(flag) {
            
        });
    },

    getDeliveryList: function(req, res) {

        async function getInformation() {
            var deliveries = await getDeliveries();
            var deliveryInfo = [];
            var invoiceStatusVoid = await getSpecificInvoiceStatusName("Void");

            for (var i = 0; i < deliveries.length; i++) {
                var date = new Date(deliveries[i].deliveryDate);
                var invoice = await getInvoice(deliveries[i].invoice_id);

                if (invoice != null) {
                    if (invoice.statusID != invoiceStatusVoid) {
                        var delivery = {
                            _id: deliveries[i]._id,
                            invoice_id: deliveries[i].invoice_id,
                            invoiceNum: invoice.invoiceID,
                            customerName: await getSpecificCustomer(invoice.customerID),
                            paymentStatus: await getSpecificInvoiceStatus(invoice.statusID),
                            amount: parseFloat(invoice.total).toFixed(2), 
                            deliveryDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                            deliveryPersonnel: await getEmployeeInfo(deliveries[i].deliveryPersonnel)
                        };
    
                        deliveryInfo.push(delivery);
                    }
                }
            }

            res.render('deliveryList', {deliveryInfo});
        }

        getInformation();
    },

    getDeliveryInfo: function(req, res) {
        var deliveryID = req.params.deliveryID;
        var items = [];

        async function getInformation() {
            var delivery = await getSpecificDelivery(deliveryID);
            var uneditedInvoice = await getInvoice(delivery.invoice_id);
            var customer = await getCustomerInfo(uneditedInvoice.customerID);
            var date = new Date(delivery.deliveryDate);
            var invocieDate = new Date(uneditedInvoice.date);

            var invoice = {
                date: invocieDate.getMonth() + 1 + "/" + invocieDate.getDate() + "/" + invocieDate.getFullYear(),
                invoiceType: await getSpecificInvoiceType(uneditedInvoice.typeID),
                paymentType: await getSpecificPaymentType(uneditedInvoice.paymentOptionID),
                subtotal: parseFloat(uneditedInvoice.subtotal).toFixed(2),
                VAT: parseFloat(uneditedInvoice.VAT).toFixed(2),
                discount: parseFloat(uneditedInvoice.discount).toFixed(2),
                total: parseFloat(uneditedInvoice.total).toFixed(2),
            };

            var deliveryInfo = {
                _id: deliveryID,
                invoice_id: uneditedInvoice._id,
                invoiceNum: uneditedInvoice.invoiceID,
                deliveryDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                deliveryNotes: delivery.deliveryNotes,
                paymentStatus: await getSpecificInvoiceStatus(uneditedInvoice.statusID)
            };

            var invoiceItems = await getInvoiceItems(invoice._id);

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

            res.render('viewDeliveryInformation', {customer, deliveryInfo, invoice, items});
        }

        getInformation();
    },

    getCustomerName: function(req, res) {
        db.findMany(Customer, {name:{$regex:req.query.query, $options:'i'}, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {
            var formattedResults = [];
    
            for (var i=0; i<result.length; i++) {
                var formattedResult = {
                    label: result[i].name,
                    value: result[i].name
                }
                formattedResults.push(formattedResult);
            }
            res.send(formattedResults)
        })
    },

    getSearchDeliveryList: function(req, res) {
        var searchItem = req.query.searchItem;
        
        async function getInformation() {
            var invoiceStatusVoid = await getSpecificInvoiceStatusName("Void");
            var deliveryInfo = [];
            var delivery;
            var date;
            var specificDelivery;

            var invoice = await getSpecificInvoice(searchItem);
            var customerInfo = await getCustomerIDs(searchItem);

            if (invoice != null) {
                if (invoice.statusID != invoiceStatusVoid) {
                    specificDelivery = await getSpecificDeliveryUsingID(invoice._id);

                console.log(specificDelivery);

                if (specificDelivery.dateDelivered == null) {
                        date = new Date(specificDelivery.deliveryDate);

                        delivery = {
                            _id: specificDelivery._id,
                            invoice_id: specificDelivery.invoice_id,
                            invoiceNum: invoice.invoiceID,
                            customerName: await getSpecificCustomer(invoice.customerID),
                            paymentStatus: await getSpecificInvoiceStatus(invoice.statusID),
                            amount: parseFloat(invoice.total).toFixed(2), 
                            deliveryDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                            deliveryPersonnel: await getEmployeeInfo(specificDelivery.deliveryPersonnel)
                        };

                        deliveryInfo.push(delivery);
                }   
                }            
            }
            
            if (customerInfo != null) {
                var typeID = await getInvoiceType("Delivery");

                for (var i = 0; i < customerInfo.length; i++) {
                    var deliveryInvoice = await getDeliveryInvoice(typeID, customerInfo[i]._id);

                    for (var j = 0; j < deliveryInvoice.length; j++) {
                        specificDelivery = await getNotDelivered(deliveryInvoice[j]._id);
                        date = new Date(specificDelivery.deliveryDate);

                        delivery = {
                            _id: specificDelivery._id,
                            invoice_id: specificDelivery.invoice_id,
                            invoiceNum: deliveryInvoice[j].invoiceID,
                            customerName: await getSpecificCustomer(deliveryInvoice[j].customerID),
                            paymentStatus: await getSpecificInvoiceStatus(deliveryInvoice[j].statusID),
                            amount: parseFloat(deliveryInvoice[j].total).toFixed(2), 
                            deliveryDate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                            deliveryPersonnel: await getEmployeeInfo(specificDelivery.deliveryPersonnel)
                        };
                        deliveryInfo.push(delivery);
                    }
                    
                }
            }

            if (deliveryInfo.length > 0)
                res.send(deliveryInfo);
            else 
                res.send(null);
		}
        getInformation();
    },

    postUpdateDelivery: function(req, res) {
        async function updateInfo(){
            var delivery_id = req.body._id;
            var invoice_id = req.body.invoice_id;
            var today = new Date();

            await postUpdateDeliveryDate(delivery_id, today);

            var invoice = await getInvoice(invoice_id);

            if (invoice.paymentOptionID == await getSpecificPaymentTypeID("COD")) {
                await updateInvoiceStatus(invoice._id, await getSpecificInvoiceStatusName("Paid"));
            }
            
            res.send(true);
        }

        updateInfo();
    },

    getCustomerInformation: function(req, res) {
        db.findOne(Customer, {name:req.query.customerName, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name number address', function(result) {
            res.send(result)
        })
    },

    getItems: function(req, res) {
        db.findMany (Items, {itemDescription:{$regex:req.query.query, $options:'i'}, informationStatusID: "618a7830c8067bf46fbfd4e4", statusID:{$ne:"61b0d6751ca91f5969f166de"}}, 'itemDescription', function (result) {
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
    },

    getCustom: function(req, res) {
        db.findMany (Customer, {name:{$regex:req.query.query, $options:'i'}, informationStatusID:"618a7830c8067bf46fbfd4e4"}, '', function (result) {
            var formatResults = [];
            //reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
            for (var i=0; i<result.length; i++) {
                var formattedResult = {
                    label: result[i].name,
                    value: result[i].value,
                };

                formatResults.push(formattedResult);
            }
            res.send(formatResults)
        })
    },

    returns: function(req, res) {
        async function getInfo() {
            var types = await getAllInvoiceTypes()

            var temp_invoiceInfo = await getInvoice(req.params.invoiceID)
            var temp_invoiceItems = await getInvoiceItems(temp_invoiceInfo._id)
            var returnReasons = await getReturnReasons();
            var paymentTypes = await getInvoiceStatus()
            var deliveryPersonnel = await getDeliveryPersonnel();

            var invoiceItems = []
            for (var i=0; i<temp_invoiceItems.length; i++) {
                var unitID = await getItemUnitItemID(temp_invoiceItems[i].itemID)
                var quantity = temp_invoiceItems[i].quantity
                var unitPrice = await getItemPrice(temp_invoiceItems[i].itemID)
                var amount = quantity * parseFloat(unitPrice)

                var invoiceItem = { 
                    itemDescription: await getItemDescription(temp_invoiceItems[i].itemID), 
                    quantity: quantity, 
                    unit: await getSpecificUnit(unitID), 
                    unitPrice: parseFloat(unitPrice).toFixed(2), 
                    discount: temp_invoiceItems[i].discount, 
                    amount: parseFloat(amount).toFixed(2), 
                    returnReasons: returnReasons 
                } 
                invoiceItems.push(invoiceItem) 
            }

            var customerInfo = await getCustomerInfo(temp_invoiceInfo.customerID)

            var invoiceInfo = { 
                invoiceID: temp_invoiceInfo.invoiceID,
                subtotal: parseFloat(temp_invoiceInfo.subtotal).toFixed(2),
                VAT: parseFloat(temp_invoiceInfo.VAT).toFixed(2),
                discount: parseFloat(temp_invoiceInfo.discount).toFixed(2),
                total: parseFloat(temp_invoiceInfo.total).toFixed(2)
            }

            res.render('return', {types, invoiceInfo, customerInfo, paymentTypes, deliveryPersonnel, invoiceItems})
        }

        getInfo();
    },

    checkQuantity: function(req, res) {
        db.findOne(Items, {itemDescription:req.query.itemDesc, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'quantityAvailable', function (result){
            if (result.quantityAvailable < req.query.quantity)
                res.send(false)
            else
                res.send(true)
        })
    },

    getItemInfo: function(req, res) {
        function getItemInfo() {
            return new Promise((resolve, reject) => {
                db.findOne(Items, {itemDescription:req.query.itemDesc, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'unitID sellingPrice', function(result) {
                    resolve(result)
                })
            })
        }

        async function getInfo() {
            var temp_item = await getItemInfo();
            var item = {
                unit: await getSpecificUnit(temp_item.unitID),
                sellingPrice: temp_item.sellingPrice
            }
            res.send(item)
        }

        getInfo();
    },

    saveReturn: function(req, res) {

        function getInvoiceItemQuantity(invoiceID, itemID) {
            return new Promise((resolve, reject) => {
                db.findOne(InvoiceItems, {invoice_id:invoiceID, itemID:itemID}, 'quantity', function(result) {
                    resolve (result.quantity)
                })
            })
        }

        function getShrinkageReasonID() {
            return new Promise((resolve, reject) => {
                db.findOne(ShrinkagesReasons, {reason:"Damaged"}, '_id', function(result) {
                    resolve(result._id)
                })
            })
        }   

        async function damagedItem(returnItem) {
            var shrinkage = {
                itemID: await getItemID(returnItem.itemDesc),
                quantityLost: returnItem.quantity,
                reasonID: await getShrinkageReasonID(),
                date: new Date(),
                employeeID: "619fb6910640ab1d9518d3b6"
            }

            db.insertOne(Shrinkages, shrinkage, function(flag) {

            })
        }

        function incorrectItem(returnItem) {
            db.findOne(Items, {itemDescription:returnItem.itemDesc}, 'quantityAvailable', function(result) {
                var updatedQuantity = parseInt(result.quantityAvailable) + parseInt(returnItem.quantity)
                db.updateOne(Items, {itemDescription:returnItem.itemDesc}, {quantityAvailable: updatedQuantity}, function(flag) {

                })
            })
        }

        async function processReturn(oldInvoiceID, returns) {
            var notReturnedItems = []

            for (var i=0; i<returns.length; i++) {

                //item is damaged
                if (returns[i].reason == "61a76e7357d8d868d3eb5b2c") 
                    damagedItem(returns[i])

                //item was incorrect
                else if (returns[i].reason == "61a76e7f57d8d868d3eb5b2d") 
                    incorrectItem(returns[i])

                var itemID = await getItemID(returns[i].itemDesc)
                var oldQuantity = await getInvoiceItemQuantity(oldInvoiceID, itemID)

                if (returns[i].quantity !=oldQuantity) {
                    var notReturnedItem = {
                        itemID: itemID,
                        quantity: returns[i].quantity
                    }
                    notReturnedItems.push(notReturnedItem)
                }
            }
            db.updateOne(Invoices, {_id:oldInvoiceID}, {statusID:"619785ceda48eab55320c0c8"}, function(flag) {

            })

            return notReturnedItems;
        }

        //--------FUNCTIONS FOR NEW INVOICE---------//

        function makeInvoiceID(invoiceNumber, customerID, invoiceInfo) {
            return new Promise((resolve, reject) => {
                var invoice = {
                    invoiceID: invoiceNumber,
                    customerID:customerID,
                    date: new Date(),
                    typeID: invoiceInfo.invoiceType,
                    statusID: invoiceInfo.statusID,
                    subtotal: invoiceInfo.subtotal, 
                    VAT: invoiceInfo.vat,
                    discount: invoiceInfo.discount,
                    total: invoiceInfo.total,
                    employeeID: "6193c0e4ea47cc5edfb484d2"
                }

                db.insertOneResult(Invoices, invoice, function(result) {
                    resolve (result._id)
                })
            })
        }

        //item deduction for sale
        function updateQuantity(invoiceItem) {
            db.findOne(Items, {itemDescription:invoiceItem.itemDesc}, 'quantityAvailable', function(result) {
                var updatedQuantity = parseInt(result.quantityAvailable) - parseInt(invoiceItem.quantity)
                db.updateOne(Items, {itemDescription:invoiceItem.itemDesc}, {quantityAvailable: updatedQuantity}, function(flag) {

                })
            })
        }

        //------------FUNCTION FOR DELIVERY-------------- 

        function newDelivery(invoiceID, deliveryInfo) {
            deliveryInfo.invoice_id = invoiceID            
            db.insertOne(deliveries, deliveryInfo, function(flag) {
                if (flag)
                    res.send(invoiceID)
            })
        }

        //------------MAIN FUNCTION FOR NEW INVOICE-------------
        async function newInvoice(invoiceInfo, notReturnedItems, invoiceItems, deliveryInfo) {
            var finalInvoiceItems = []
            var invoiceNumber = await getInvoiceNumber()
            var customerID =  await getCustomerID(invoiceInfo.customerName)

            var invoiceID = await makeInvoiceID(invoiceNumber, customerID, invoiceInfo);

            for (var i=0; i<invoiceItems.length; i++) {
                invoiceItems[i].itemID = await getItemID(invoiceItems[i].itemDesc)
                invoiceItems[i].invoice_id = invoiceID
                invoiceItems[i].discount = 0
                updateQuantity (invoiceItems[i])
                finalInvoiceItems.push(invoiceItems[i])
            }

            if (notReturnedItems.length != 0) {
                for (var i=0; i<notReturnedItems.length; i++) {
                    var item = {
                        invoice_id: invoiceID,
                        itemID: notReturnedItems[i].itemID,
                        quantity: notReturnedItems[i].quantity,
                        discount: 0
                    }
                    finalInvoiceItems.push(item)
                }
            }

            db.insertMany(InvoiceItems, finalInvoiceItems, function(flag) {
            
            })

            //order is delivery
            if (invoiceInfo.invoiceType == "61a591c1233fa7f9abcd5726") 
                newDelivery(invoiceID, deliveryInfo)
            else
                res.send(invoiceID) 
            
        }

        var oldInvoiceID = req.body.oldInvoiceID
        var returns = JSON.parse(req.body.returnsString)
        var newInvoiceItems = JSON.parse(req.body.newInvoiceItemsString)   
        var newInvoiceInfo = JSON.parse(req.body.invoiceInfoString)
        var deliveryInfo = JSON.parse(req.body.deliveryInfoString)
    
        processReturn(oldInvoiceID, returns).then(notReturnedItems => {
            newInvoice(newInvoiceInfo, notReturnedItems, newInvoiceItems, deliveryInfo)
        })
    },

    payOneInvoice: function(req, res) {

        async function pay() {
            var amountPaid = req.body.amountPaid
            var invoiceID = req.body.invoiceID

            var invoiceTotal = await getInvoiceTotal(invoiceID);

            var previousPayments = await getAmountPaid(invoiceID)

            if ((parseFloat(amountPaid)+parseFloat(previousPayments)) ==  invoiceTotal)
                db.updateOne(Invoices, {_id:invoiceID}, {statusID:"619785b0d9a967328c1e8fa6"}, function(flag){
                    if (flag) { }
                })

            var newPayment = {
                invoiceID: invoiceID,
                datePaid: new Date(),
                amountPaid: amountPaid
            }

            db.insertOne(AccountPayments, newPayment, function(flag) {
            })
            res.sendStatus(200)
        }

        pay()
    },

    exportInvoice: function(req, res) {
        var customerName = req.query.customerName
        var items = JSON.parse(req.query.itemsString)

        var temp_fDate0 = req.query.date.split(",");
        var temp_fDate = temp_fDate0[0].split("/")
        var fDate = ""  
        for (var i=0; i<temp_fDate.length; i++)
            fDate += temp_fDate[i] + "_"


        var fileName = fDate + customerName

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
            //invoiceNumber: req.query.poNumber,
            date: temp_fDate0[0],
            customer_name: supplierInfo.name,
            items:items
        });

        const buf = doc.getZip().generate({ type: "nodebuffer" });

        fs.writeFileSync(path.resolve("documents", fileName+".docx"), buf);

        res.sendStatus(200)
    }
};

module.exports = invoiceController;