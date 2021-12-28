// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Invoices = require('../models/InvoiceModel.js');

require('../controllers/helpers.js')();

const reportController = {

	getSalesReport: function(req, res) {

        async function getInformation() {
            var paidStatusID = await getSpecificInvoiceStatusID("Paid");
            var invoices = await getPaidInvoices(paidStatusID);
            var today = new Date().toLocaleString('en-US');
            var formattedInvoices = [];
            var total = 0;

            for (var i = 0; i < invoices.length; i++) {
                var date = new Date(invoices[i].date);
                
                var formattedInvoice = {
                    date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    invoiceID: invoices[i].invoiceID,
                    subtotal: parseFloat(invoices[i].subtotal).toFixed(2),
                    discount: parseFloat(invoices[i].discount).toFixed(2),
                    total: parseFloat(invoices[i].total).toFixed(2)
                };

                formattedInvoices.push(formattedInvoice);

                total +=  invoices[i].total;
            }

            total = parseFloat(total).toFixed(2);

            res.render('salesReport', {formattedInvoices, total, today});
        }

        getInformation();
    },
    
    getFilteredSalesReport: function(req, res) {
        var startDate = new Date(req.query.startDate);
        var endDate = new Date(req.query.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        
        async function getInformation() {
            var paidStatusID = await getSpecificInvoiceStatusID("Paid");
            var invoices = await getPaidInvoices(paidStatusID);
            var formattedInvoices = [];

            for (var i = 0; i < invoices.length; i++) {
                var date = new Date(invoices[i].date);
                date.setHours(0,0,0,0);
                
                if (!(startDate > date || date > endDate)) {
                    var formattedInvoice = {
                        date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                        invoiceID: invoices[i].invoiceID,
                        subtotal: parseFloat(invoices[i].subtotal).toFixed(2),
                        discount: parseFloat(invoices[i].discount).toFixed(2),
                        total: parseFloat(invoices[i].total).toFixed(2)
                    };
    
                    formattedInvoices.push(formattedInvoice);
                }
            }
            console.log(formattedInvoices);
            res.send(formattedInvoices);
        }

        getInformation();
    },

    getDateToday: function(req, res) {
		var today = new Date().toLocaleString('en-US');

		res.send(today);
	}
};

module.exports = reportController;