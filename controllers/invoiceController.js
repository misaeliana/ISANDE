// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceTypes = require('../models/InvoiceTypesModel.js');

const InvoiceStatus = require('../models/InvoiceStatusModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

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

			res.render('viewInvoice', {invoiceInfo, items});
		}

		getInformation();
		
	}
};

module.exports = invoiceController;