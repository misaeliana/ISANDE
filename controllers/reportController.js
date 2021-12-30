// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedItems = require('../models/PurchasedItemsModel.js');

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

            // check if invoice is paid
            
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
            var paidStatus = await getSpecificInvoiceStatusID("Paid");

            for (var i = 0; i < inventory.length; i++) {
                var unitsSold = 0;
                var itemTotal = 0;

                // get number of units sold
                for (var j = 0 ; j < invoiceItems.length; j++) {
                  
                    if ((await getItemDescription(invoiceItems[j].itemID) == inventory[i].itemDescription) && (await checkInvoicePaid(invoiceItems[j].invoice_id) == paidStatus)) {
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

            // get top 50
            formattedInventory = formattedInventory.slice(0, 50);

            for (var k = 0; k < formattedInventory.length; k++)
                formattedInventory[k].rank = k + 1;

            overallTotal = overallTotal.toFixed(2);

            res.render('salesPerformanceReport', {formattedInventory, overallTotal, today});
        }

        getInformation();
    },

    getPurchaseReports: function(req, res) {
        async function getInfo() {

            var today = new Date().toLocaleString('en-US');
            var temp_purchases = await getPurchases();
            var purchases = [];
            var total =0;

            for (var i=0; i<temp_purchases.length; i++) {
                var dateMade = new Date(temp_purchases[i].date);
                var dateReceived = new Date(temp_purchases[i].dateReceived)
                var purchase = {
                    dateMade: dateMade.getMonth() + 1 + "/" + dateMade.getDate() + "/" + dateMade.getFullYear(),
                    poNumber: temp_purchases[i].purchaseOrderNumber,
                    supplier: await getSupplierName(temp_purchases[i].supplierID),
                    dateReceived: dateReceived.getMonth() + 1 + "/" + dateReceived.getDate() + "/" + dateReceived.getFullYear(),
                    amountPaid: temp_purchases[i].total.toLocaleString('en-US')
                }
                purchases.push(purchase);
                total += parseFloat(temp_purchases[i].total);
            }
            total = total.toLocaleString('en-US');
            
            res.render('purchasesReport', {today, purchases, total})
        }

        getInfo();
    },

    getFilteredPurchaseReport: function(req, res) {

        async function getInfo() {
            var today = new Date().toLocaleString('en-US');
            var temp_purchases = await getPurchases();
            var purchases = [];

            for (var i=0; i<temp_purchases.length; i++) {
                var dateMade = new Date(temp_purchases[i].date);
                var dateReceived = new Date(temp_purchases[i].dateReceived);
                dateMade.setHours(0,0,0,0);
                
                if (!(startDate > dateMade || dateMade > endDate)) {
                    var purchase = {
                        dateMade: dateMade.getMonth() + 1 + "/" + dateMade.getDate() + "/" + dateMade.getFullYear(),
                        poNumber: temp_purchases[i].purchaseOrderNumber,
                        supplier: await getSupplierName(temp_purchases[i].supplierID),
                        dateReceived: dateReceived.getMonth() + 1 + "/" + dateReceived.getDate() + "/" + dateReceived.getFullYear(),
                        amountPaid: temp_purchases[i].total
                        };
                    purchases.push(purchase);
                }
            }
            res.send(purchases);
        }

        getInfo();
    },

    getSalesPerCustomer: function(req, res) {
        var today = new Date().toLocaleString('en-US');
        var total = 0;

        res.render('salesPerCustomerReport', {today, total});
    },

    getCustomerInvoicesReport: function(req, res) {

        async function getInfo() {
            var customer = await getCustomerIDs(req.query.customerName);
            var invoices = [];

            for (var i=0; i<customer.length; i++) {
                var invoice = await getCustomerInvoices(customer[i]._id);
                invoices.push(invoice);
            }

            res.send(invoices[1]);
        }

        getInfo();
    },

    getFilteredCustomerInvoices: function(req, res) {
        var startDate = new Date(req.query.startDate);
        var endDate = new Date(req.query.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);

        async function getInfo() {
            var customer = await getCustomerIDs(req.query.customerName);
            var temp_invoices = [];

            for (var i=0; i<customer.length; i++) {
                var invoice = await getCustomerInvoices(customer[i]._id);
                temp_invoices.push(invoice);
            }

            temp_invoices = temp_invoices[1];
            var invoices = [];

            for (var j=0; j<temp_invoices.length; j++) {
                var date= new Date(temp_invoices[j].date);
                date.setHours(0,0,0,0);

                if (!(startDate > date || date > endDate)) {
                    invoices.push(temp_invoices[j]);
                }
            }
 
            //var invoices = []
            console.log(invoices);

            res.send(invoices);
        }

        getInfo();
    },

    getFilteredSalesPerformanceReport: function(req, res) {
        var startDate = new Date(req.query.startDate);
        var endDate = new Date(req.query.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        var sortFilter = req.query.sortFilter;
        var numberFilter = req.query.numberFilter;

        async function getInformation() {
            var allInventory = await getAllInventoryItems();
            var inventory = await filterInventory(allInventory);
            var invoiceItems = await getAllInvoiceItems();
            var formattedInventory = [];

            for (var i = 0; i < inventory.length; i++) {
                var unitsSold = 0;
                var itemTotal = 0;

                for (var j = 0 ; j < invoiceItems.length; j++) {
                    if (await getItemDescription(invoiceItems[j].itemID) == inventory[i].itemDescription) {
                        
                        var invoiceDate = new Date(await getInvoiceDate(invoiceItems[j].invoice_id));
                        invoiceDate.setHours(0,0,0,0);

                        if ((!(startDate > invoiceDate || invoiceDate > endDate)) && (await checkInvoicePaid(invoiceItems[j].invoice_id) ==  await getSpecificInvoiceStatusID("Paid"))) {
                            unitsSold += parseFloat(invoiceItems[j].quantity);
                            itemTotal += parseFloat(await getItemPrice(invoiceItems[j].itemID)) - invoiceItems[j].discount;
                        }
                    }
                }

                var item = {
                    rank: 1,
                    description: inventory[i].itemDescription,
                    unitsSold: unitsSold,
                    UOM: await getSpecificUnit(inventory[j].unitID),
                    total: itemTotal.toFixed(2)
                };

                formattedInventory.push(item);
            } 

            if (sortFilter == "best-selling")
                formattedInventory.sort((a, b) => (a.total > b.total) ? -1 : 1);
            else 
                formattedInventory.sort((a, b) => (a.total > b.total) ? 1 : -1);

            formattedInventory = formattedInventory.slice(0, numberFilter);

            for (var k = 0; k < formattedInventory.length; k++)
                formattedInventory[k].rank = k + 1;

            res.send(formattedInventory);
        }

        getInformation();
    }
};

module.exports = reportController;