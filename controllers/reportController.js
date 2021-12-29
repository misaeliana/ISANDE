// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

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
    },
    
    getInventoryPerformanceReport: function(req, res) {
        
        async function getInformation() {
            var today = new Date().toLocaleString('en-US');
            var allInventory = await getAllInventoryItems();
            var inventory = await filterInventory(allInventory);
            var formattedInventory = [];
            var categories = await getItemCategories();
            var invoiceItems = await getAllInvoiceItems();
            
            //console.log(invoiceItems);

            /*for (var i = 0; i < categories.length; i++) {
                formattedInventory.push(getItemCategories[i].category);
            }*/
            
            for (var j = 0; j < inventory.length; j++) {
                var unitsSold = 0;

                // get number of units sold
                for (var k = 0 ; k < invoiceItems.length; k++) {
                  
                    if (await getItemDescription(invoiceItems[k].itemID) == inventory[j].itemDescription) {
                        unitsSold += parseFloat(invoiceItems[k].quantity);
                    }
                }

                var item = {
                    category: await getSpecificItemCategory(inventory[j].categoryID),
                    rank: 1,
                    description: inventory[j].itemDescription,
                    unitsSold: unitsSold,
                    UOM: await getSpecificUnit(inventory[j].unitID)
                };

                formattedInventory.push(item);
            }

            formattedInventory.sort((a, b) => (a.unitsSold > b.unitsSold) ? -1 : 1);

            res.render('inventoryPerformanceReport', {formattedInventory, today});
        }

        getInformation();
    },

    getSalesPerformanceReport: function(req, res) {

        async function getInformation() {
            var today = new Date().toLocaleString('en-US');
            var allInventory = await getAllInventoryItems();
            var inventory = await filterInventory(allInventory);
            var formattedInventory = [];
            var invoiceItems = await getAllInvoiceItems();
            var overallTotal = 0;

            for (var i = 0; i < inventory.length; i++) {
                var unitsSold = 0;
                var itemTotal = 0;

                // get number of units sold
                for (var j = 0 ; j < invoiceItems.length; j++) {
                  
                    if (await getItemDescription(invoiceItems[j].itemID) == inventory[i].itemDescription) {
                        unitsSold += parseFloat(invoiceItems[j].quantity);
                        itemTotal += parseFloat(await getItemPrice(invoiceItems[j].itemID)) - invoiceItems[j].discount;
                    }
                }

                var item = {
                    rank: 1,
                    description: inventory[i].itemDescription,
                    unitsSold: unitsSold,
                    UOM: await getSpecificUnit(inventory[j].unitID),
                    total: itemTotal.toFixed(2)
                };

                overallTotal += parseFloat(item.total);

                formattedInventory.push(item);
            }      

            // sort by best-selling
            formattedInventory.sort((a, b) => (a.total > b.total) ? -1 : 1);

            // get top 10
            formattedInventory = formattedInventory.slice(0, 10);

            for (var k = 0; k < formattedInventory.length; k++)
                formattedInventory[k].rank = k + 1;

            overallTotal = overallTotal.toFixed(2);

            res.render('salesPerformanceReport', {formattedInventory, overallTotal, today});
        }

        getInformation();
    }
};

module.exports = reportController;