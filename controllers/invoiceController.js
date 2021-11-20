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
                    total: invoices[i].total,
                    type: await getSpecificInvoiceType(invoices[i].typeID),
                    status: await getSpecificInvoiceStatus(invoices[i].statusID)
                };

                invoicesInfo.push(invoiceInfo);
            }

			res.render('invoiceList', {invoicesInfo});
		}

		getInformation();
	}
};

module.exports = invoiceController;