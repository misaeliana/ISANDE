// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

const ItemCategories = require('../models/ItemCategoriesModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedItems = require('../models/PurchasedItemsModel.js');

const Items = require('../models/ItemsModel.js');

const path = require('path');

const fs = require('fs');

const PizZip = require("pizzip");

const Docxtemplater = require("docxtemplater");

require('../controllers/helpers.js')();

const reportController = {

	getSalesReport: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
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
                        gross: numberWithCommas(parseFloat(parseFloat(invoices[i].total) +  parseFloat(invoices[i].discount)).toFixed(2)),
                        discount: numberWithCommas(parseFloat(invoices[i].discount).toFixed(2)),
                        total: numberWithCommas(parseFloat(invoices[i].total).toFixed(2))
                    };

                    formattedInvoices.push(formattedInvoice);

                    total +=  invoices[i].total;
                }

                total = numberWithCommas(parseFloat(total).toFixed(2));

                res.render('salesReport', {formattedInvoices, total, today});
            }

            getInformation();
        }
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
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
            function getItemCategory(itemID) {
                return new Promise((resolve, reject) => {
                    db.findOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'categoryID', function(result) {
                        resolve(result);
                    });
                });
            }

            function getRetailQuantity(itemID) {
                return new Promise((resolve, reject) => {
                    db.findOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'retailQuantity', function (result) {
                        resolve(result.retailQuantity)
                    })
                })
            }

            async function convert(itemID, invoiceQuantity) {
                var retailQuantity = await getRetailQuantity(itemID);
                console.log(retailQuantity)
                var convertedQuantity = invoiceQuantity/retailQuantity;
                return parseFloat(convertedQuantity);
            }
            
            async function getInformation() {
                var today = new Date().toLocaleString('en-US');
                var allInventory = await getAllInventoryItems();
                var inventory = await filterInventory(allInventory);    //inventory items with no duplicate
                var formattedInventory = [];
                var categories = await getItemCategories();
                var invoiceItems = await getAllInvoiceItems();

                var paidStatus = await getSpecificInvoiceStatusID("Paid");

                //console.log(invoiceItems);

                /*for (var i = 0; i < categories.length; i++) {
                    formattedInventory.push(getItemCategories[i].category);
                }*/

                // check if invoice is paid

                for (var a=0; a<categories.length; a++) {
                    var categoryItems = [];
                    var temp  = {
                        category: categories[a].category
                    };
                    formattedInventory.push(temp);

                    var itemCount = 0;

                    for (var j = 0; j < inventory.length; j++) {
                        var unitsSold = 0;

                        if (categories[a]._id == inventory[j].categoryID) {

                            // get number of units sold
                            for (var k = 0 ; k < invoiceItems.length; k++) {

                                var itemUnitInfo = await getItemUnitInfo(invoiceItems[k].itemUnitID);

                                    if (await getItemDescription(itemUnitInfo.itemID) == inventory[j].itemDescription && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {
                                        //no need conversion
                                        if (itemUnitInfo.unitID == inventory[j].unitID)
                                            unitsSold += parseFloat(invoiceItems[k].quantity);
                                        else
                                            unitsSold += await convert(itemUnitInfo.itemID, invoiceItems[k].quantity);
                                    }
                            }

                            var item = {
                                rank: 1,
                                description: inventory[j].itemDescription,
                                unitsSold: parseFloat(unitsSold).toFixed(2),
                                UOM: await getSpecificUnit(inventory[j].unitID)
                            };
                            itemCount++;
                            formattedInventory.push(item);
                        }
                    }

                    var toBeArranged = [];
                    for (var z=formattedInventory.length-1; itemCount>0; itemCount--) {
                        var item = formattedInventory.pop();
                        toBeArranged.push(item);
                    }

                    toBeArranged.sort((a, b) => (a.unitsSold > b.unitsSold) ? -1 : 1);

                    for (var y=0; y<toBeArranged.length; y++) {
                        toBeArranged[y].rank = y + 1;
                        //console.log(toBeArranged[y]);
                        formattedInventory.push(toBeArranged[y]);
                    }   

                }

                

                //console.log(formattedInventory);

                res.render('inventoryPerformanceReport', {formattedInventory, today});
            }

            getInformation();
        }
    },

    getFilteredInventoryPerformanceReport: function(req, res) {
        function getCategoryID(categoryName) {
            return new Promise((resolve, reject) => {
                db.findOne(ItemCategories, {category:categoryName}, '_id', function (result) {
                    resolve(result._id)
                })
            })
        }

        function getRetailQuantity(itemID) {
                return new Promise((resolve, reject) => {
                    db.findOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'retailQuantity', function (result) {
                        resolve(result.retailQuantity)
                    })
                })
            }

        async function convert(itemID, invoiceQuantity) {
            var retailQuantity = await getRetailQuantity(itemID);
            console.log(retailQuantity)
            var convertedQuantity = invoiceQuantity/retailQuantity;
            return parseFloat(convertedQuantity);
        }

        async function getInformation() {
            var startDate = new Date(req.query.startDate);
            var endDate = new Date(req.query.endDate);
            startDate.setHours(0,0,0,0);
            endDate.setHours(0,0,0,0);
            var invoiceItems = await getAllInvoiceItems();
            var formattedInventory = []
            var paidStatus = await getSpecificInvoiceStatusID("Paid");


            var sortFilter = req.query.sortFilter
            var numberFilter = req.query.numberFilter

            var allInventory = await getAllInventoryItems();
            var inventory = await filterInventory(allInventory);    //inventory items with no duplicate
            var categoryID  = await getCategoryID(req.query.category)

            for (var j = 0; j < inventory.length; j++) {
                var unitsSold = 0;

                if (categoryID == inventory[j].categoryID) {

                    // get number of units sold
                    for (var k = 0 ; k < invoiceItems.length; k++) {

                        var invoiceDate = new Date(await getInvoiceDate(invoiceItems[k].invoice_id));
                        invoiceDate.setHours(0,0,0,0);

                        var itemUnitInfo = await getItemUnitInfo(invoiceItems[k].itemUnitID);

                        if ((!(startDate > invoiceDate || invoiceDate > endDate)) && (await getItemDescription(itemUnitInfo.itemID) == inventory[j].itemDescription) && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {

                            if (await getItemDescription(itemUnitInfo.itemID) == inventory[j].itemDescription) {
                                //no need conversion
                                if (itemUnitInfo.unitID == inventory[j].unitID)
                                    unitsSold += parseFloat(invoiceItems[k].quantity);
                                else
                                    unitsSold += await convert(itemUnitInfo.itemID, invoiceItems[k].quantity);
                            }
                        }
                    }

                    var item = {
                        rank: 1,
                        description: inventory[j].itemDescription,
                        unitsSold: parseFloat(unitsSold).toFixed(2),
                        UOM: await getSpecificUnit(inventory[j].unitID)
                    };
                    formattedInventory.push(item);
                }
            }


            if (sortFilter == "best-selling")
                formattedInventory.sort((a, b) => (a.unitsSold > b.unitsSold) ? -1 : 1);
            else 
                formattedInventory.sort((a, b) => (a.unitsSold > b.unitsSold) ? 1 : -1);

            for (var k = 0; k < formattedInventory.length; k++)
                formattedInventory[k].rank = k + 1;

            
            res.send(formattedInventory);
        }

        getInformation();
    },

    getSalesPerformanceReport: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
            async function getInformation() {
                var today = new Date().toLocaleString('en-US');
                var allInventory = await getAllInventoryItems();
                var inventory = await filterInventory(allInventory);
                var formattedInventory = [];
                var invoiceItems = await getAllInvoiceItems();
                var overallTotal = 0;
                var paidStatus = await getSpecificInvoiceStatusID("Paid");

                for (var i = 0; i < inventory.length; i++) {

                    var sellingUnits = await getItemUnits(inventory[i]._id);

                    for (var j=0; j<sellingUnits.length; j++) {

                        var unitsSold = 0;
                        var itemTotal = 0;

                        // get number of units sold
                        for (var k = 0 ; k < invoiceItems.length; k++) {
                            var itemUnitInfo = await getItemUnitInfo(invoiceItems[k].itemUnitID);

                            if ((itemUnitInfo.itemID == inventory[i]._id) && (sellingUnits[j].unitID == itemUnitInfo.unitID) && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {
                                unitsSold += parseFloat(invoiceItems[k].quantity);
                                itemTotal += (invoiceItems[k].quantity * parseFloat(itemUnitInfo.sellingPrice)) - invoiceItems[k].discount;
                            }
                        }

                        var item = {
                            rank: 1,
                            description: inventory[i].itemDescription,
                            unitsSold: unitsSold,
                            UOM: await getSpecificUnit(sellingUnits[j].unitID),
                            total: itemTotal
                        };

                        overallTotal += parseFloat(item.total);
                        formattedInventory.push(item);
                    }
                }      

                // sort by best-selling
                formattedInventory.sort((a, b) => (a.total > b.total) ? -1 : 1);

                // get top 50
                formattedInventory = formattedInventory.slice(0, 50);

                for (var k = 0; k < formattedInventory.length; k++) {
                    formattedInventory[k].total = numberWithCommas(parseFloat(formattedInventory[k].total).toFixed(2))
                    formattedInventory[k].rank = k + 1;
                }

                overallTotal = numberWithCommas(overallTotal.toFixed(2));

                res.render('salesPerformanceReport', {formattedInventory, overallTotal, today});
            }

            getInformation();
        }
    },

    getFilteredSalesPerformanceReport: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
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
                var overallTotal = 0;
                var paidStatus = await getSpecificInvoiceStatusID("Paid");

                for (var i = 0; i < inventory.length; i++) {

                    var sellingUnits = await getItemUnits(inventory[i]._id);

                    for (var j=0; j<sellingUnits.length; j++) {
                        var unitsSold = 0;
                        var itemTotal = 0;

                        // get number of units sold
                        for (var k = 0 ; k < invoiceItems.length; k++) {
                            var invoiceDate = new Date(await getInvoiceDate(invoiceItems[k].invoice_id));
                            invoiceDate.setHours(0,0,0,0);

                            var itemUnitInfo = await getItemUnitInfo(invoiceItems[k].itemUnitID);

                            if ((!(startDate > invoiceDate || invoiceDate > endDate)) && (await getItemDescription(itemUnitInfo.itemID) == inventory[i].itemDescription) && (sellingUnits[j].unitID == itemUnitInfo.unitID) && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {
                                console.log("adding");
                                unitsSold += parseFloat(invoiceItems[k].quantity);
                                itemTotal += (invoiceItems[k].quantity * (parseFloat(itemUnitInfo.sellingPrice) - invoiceItems[k].discount));
                            }
                        }

                        var item = {
                            rank: 1,
                            description: inventory[i].itemDescription,
                            unitsSold: unitsSold,
                            UOM: await getSpecificUnit(sellingUnits[j].unitID),
                            total: itemTotal
                        };

                        overallTotal += parseFloat(item.total);
                        formattedInventory.push(item);
                    }
                }

                if (sortFilter == "best-selling")
                    formattedInventory.sort((a, b) => (a.total > b.total) ? -1 : 1);
                else 
                    formattedInventory.sort((a, b) => (a.total > b.total) ? 1 : -1);

                formattedInventory = formattedInventory.slice(0, numberFilter);

                for (var k = 0; k < formattedInventory.length; k++) {
                    formattedInventory[i].total = parseFloat(formattedInventory[i].total).toFixed(2)
                    formattedInventory[k].rank = k + 1;
                }

                res.send(formattedInventory);
            }

            getInformation();
        }
    },

    getPurchaseReports: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
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
                        amountPaid: numberWithCommas(temp_purchases[i].total.toFixed(2))
                    };
                    purchases.push(purchase);
                    total += parseFloat(temp_purchases[i].total);
                }
                total = numberWithCommas(total.toFixed(2));
                
                res.render('purchasesReport', {today, purchases, total});
            }

            getInfo();
        }
    },

    getFilteredPurchaseReport: function(req, res) {

        async function getInfo() {
            var today = new Date().toLocaleString('en-US');
            var temp_purchases = await getPurchases();
            var purchases = [];

            var startDate = new Date(req.query.startDate);
            var endDate = new Date(req.query.endDate);
            startDate.setHours(0,0,0,0);
            endDate.setHours(0,0,0,0);

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
                        amountPaid: temp_purchases[i].total.toFixed(2)
                        };
                    purchases.push(purchase);
                }
            }
            res.send(purchases);
        }

        getInfo();
    },

    getSalesPerCustomer: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
            var today = new Date().toLocaleString('en-US');
            var total = 0;

            res.render('salesPerCustomerReport', {today, total});
        }
    },

    getCustomerInvoicesReport: function(req, res) {

        async function getInfo() {
            var customer = await getCustomerIDs(req.query.customerName);
            var invoices = [];

            for (var i=0; i<customer.length; i++) {
                var invoice = await getCustomerInvoices(customer[i]._id);

                for (var j=0; j<invoice.length; j++)
                    invoices.push(invoice[j]);
            }
            res.send(invoices);
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
                for (var j=0; j<invoice.length; j++)
                    temp_invoices.push(invoice[j])
            }

            var invoices = [];

            for (var j=0; j<temp_invoices.length; j++) {
                var date= new Date(temp_invoices[j].date);
                date.setHours(0,0,0,0);

                if (!(startDate > date || date > endDate)) {
                    invoices.push(temp_invoices[j]);
                }
            }
            //console.log(invoices)

            res.send(invoices);
        }
        getInfo();
    },

    exportSalesPerCustomer: function(req, res) {

        async function getInfo() {
            var startDate = req.query.startDate
            var endDate = req.query.endDate

            var customer = await getCustomerIDs(req.query.customerName)
            var invoices = []
            var totalSales = 0

            //there is date filter
            if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                startDate = new Date(req.query.startDate)
                endDate = new Date(req.query.endDate)
                startDate.setHours(0,0,0,0);
                endDate.setHours(0,0,0,0);

                var fstartDate = startDate.getMonth() + 1 + "/" + startDate.getDate() + "/" + startDate.getFullYear()
                var fendDate = endDate.getMonth() + 1 + "/" + endDate.getDate() + "/" + endDate.getFullYear()
            }    

            for (var i=0; i<customer.length; i++) {
                var invoice = await getCustomerInvoices(customer[i]._id);

                for (var j=0; j<invoice.length; j++)  {
                    //no date filters
                    if ((startDate == null || startDate == "") && (endDate == null || endDate == "")) {
                        invoices.push(invoice[j]);
                    }

                    //date filter
                    else {
                        var date= new Date(invoice[j].date);
                        date.setHours(0,0,0,0);

                        if (!(startDate > date || date > endDate)) {
                            invoices.push(invoice[j]);
                        }
                    }
                }
            }

            for (k=0; k<invoices.length; k++) {
                invoices[k].ftotal = "₱ " + numberWithCommas(parseFloat(invoices[k].total).toFixed(2)) 
                totalSales += parseFloat(invoices[k].total)
                var date = new Date(invoices[k].date)
                invoices[k].invoiceDate = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
            }

            //no date filter, base start and end date on invoices
            if ((startDate == null || startDate == "") || (endDate == null || endDate == "")) {
                var fstartDate = invoices[0].invoiceDate
                var today= new Date()
                var fendDate = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
            }

            var fileName = "Sales_" + req.query.customerName + ".docx"

            const content = fs.readFileSync(
                path.resolve("files", "salesPerCustomer_template.docx"), "binary"
            );

            const zip = new PizZip(content);
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            var date = new Date()
            dateGenerated = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()

            doc.render({
                dateGenerated: dateGenerated,
                customerName: req.query.customerName,
                startDate: fstartDate,
                endDate: fendDate,
                sales: invoices,
                totalSales: "₱ " + numberWithCommas(parseFloat(totalSales).toFixed(2))
            });

            const buf = doc.getZip().generate({ type: "nodebuffer" });

            if (!fs.existsSync(path.resolve('documents')))
                fs.mkdirSync('documents');

            fs.writeFileSync(path.resolve("documents", fileName), buf);

            res.send(fileName)
        }

        getInfo()
    },

    exportSales: function(req, res) {
        async function getInformation() {
            var paidStatusID = await getSpecificInvoiceStatusID("Paid");
            var invoices = await getPaidInvoices(paidStatusID);
            var formattedInvoices = [];
            var totalSales = 0;

            var startDate = req.query.startDate
            var endDate = req.query.endDate

            //there is date filter
            if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                startDate = new Date(req.query.startDate)
                endDate = new Date(req.query.endDate)
                startDate.setHours(0,0,0,0);
                endDate.setHours(0,0,0,0);

                var fstartDate = startDate.getMonth() + 1 + "/" + startDate.getDate() + "/" + startDate.getFullYear()
                var fendDate = endDate.getMonth() + 1 + "/" + endDate.getDate() + "/" + endDate.getFullYear()
            }   

            for (var i = 0; i < invoices.length; i++) {
                var date = new Date(invoices[i].date);
                
                var formattedInvoice = {
                    ddate: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                    invoiceID: invoices[i].invoiceID,
                    gross: "₱ " + numberWithCommas(parseFloat(parseFloat(invoices[i].total) +  parseFloat(invoices[i].discount)).toFixed(2)),
                    discount: "₱ " + numberWithCommas(parseFloat(invoices[i].discount).toFixed(2)),
                    total: "₱ " + numberWithCommas(parseFloat(invoices[i].total).toFixed(2))
                };

                //there is date filter
                if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                     if (!(startDate > date || date > endDate)) {
                        formattedInvoices.push(formattedInvoice);     
                        totalSales +=  invoices[i].total;
                     }
                }
                else {
                    formattedInvoices.push(formattedInvoice);
                    totalSales +=  invoices[i].total;
                }

            }

            var date = new Date()
            dateGenerated = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
            fileNameDate = date.getMonth() + 1 + "_" + date.getDate() + "_" + date.getFullYear()

             //no date filter, base start and end date on invoices
            if ((startDate == null || startDate == "") || (endDate == null || endDate == "")) {
                var fstartDate = formattedInvoices[0].ddate
                var today= new Date()
                var fendDate = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
            }

            var fileName = "Sales_Report_" + fileNameDate + ".docx"

            const content = fs.readFileSync(
                path.resolve("files", "salesReports_template.docx"), "binary"
            );

            const zip = new PizZip(content);
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // render the document
            doc.render({
                dateGenerated: dateGenerated,
                startDate: fstartDate,
                endDate: fendDate,
                sales: formattedInvoices,
                totalSales: "₱ " + numberWithCommas(parseFloat(totalSales).toFixed(2))
            });

            const buf = doc.getZip().generate({ type: "nodebuffer" });

            if (!fs.existsSync(path.resolve('documents')))
                fs.mkdirSync('documents');

            fs.writeFileSync(path.resolve("documents", fileName), buf);

            res.send(fileName)

        }

        getInformation();
    },

    exportSalesPerformance: function(req, res) {
        async function getInformation() {
            var allInventory = await getAllInventoryItems();
            var inventory = await filterInventory(allInventory);
            var formattedInventory = [];
            var invoiceItems = await getAllInvoiceItems();
            var overallTotal = 0;
            var paidStatus = await getSpecificInvoiceStatusID("Paid");

            var startDate = req.query.startDate
            var endDate = req.query.endDate

            //there is date filter
            if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                startDate = new Date(req.query.startDate)
                endDate = new Date(req.query.endDate)
                startDate.setHours(0,0,0,0);
                endDate.setHours(0,0,0,0);

                var fstartDate = startDate.getMonth() + 1 + "/" + startDate.getDate() + "/" + startDate.getFullYear()
                var fendDate = endDate.getMonth() + 1 + "/" + endDate.getDate() + "/" + endDate.getFullYear()
            }   

            for (var i = 0; i < inventory.length; i++) {

                var sellingUnits = await getItemUnits(inventory[i]._id);

                for (var j=0; j<sellingUnits.length; j++) {

                    var unitsSold = 0;
                    var itemTotal = 0;

                    // get number of units sold
                    for (var k = 0 ; k < invoiceItems.length; k++) {
                        var itemUnitInfo = await getItemUnitInfo(invoiceItems[k].itemUnitID);


                        //there is date filter
                        if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                            var invoiceDate = new Date(await getInvoiceDate(invoiceItems[k].invoice_id));

                            if ((!(startDate > invoiceDate || invoiceDate > endDate)) && (await getItemDescription(itemUnitInfo.itemID) == inventory[i].itemDescription) && (sellingUnits[j].unitID == itemUnitInfo.unitID) && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {
                                console.log("adding");
                                unitsSold += parseFloat(invoiceItems[k].quantity);
                                itemTotal += (invoiceItems[k].quantity * (parseFloat(itemUnitInfo.sellingPrice) - invoiceItems[k].discount));
                            }
                        }
                        else {
                            if ((itemUnitInfo.itemID == inventory[i]._id) && (sellingUnits[j].unitID == itemUnitInfo.unitID) && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {
                                unitsSold += parseFloat(invoiceItems[k].quantity);
                                itemTotal += (invoiceItems[k].quantity * (parseFloat(itemUnitInfo.sellingPrice) - invoiceItems[k].discount));
                            }
                        }
                    }

                    var item = {
                        rank: 1,
                        description: inventory[i].itemDescription,
                        unitsSold: unitsSold,
                        UOM: await getSpecificUnit(sellingUnits[j].unitID),
                        total: itemTotal
                    }; 

                    overallTotal += parseFloat(itemTotal);
                    formattedInventory.push(item);
                }
            }      

            // sort by best-selling
            formattedInventory.sort((a, b) => (a.total > b.total) ? -1 : 1);

            // get top 50
            formattedInventory = formattedInventory.slice(0, 50);

            for (var k = 0; k < formattedInventory.length; k++) {
                formattedInventory[k].total =  "₱ " + numberWithCommas(parseFloat(formattedInventory[k].total).toFixed(2))
                formattedInventory[k].rank = k + 1;
            }

            //no date filter, base start and end date on invoices
            if ((startDate == null || startDate == "") || (endDate == null || endDate == "")) {
                var invoiceDate = new Date(await getInvoiceDate(invoiceItems[0].invoice_id))
                var fstartDate = invoiceDate.getMonth() + 1 + "/" + invoiceDate.getDate() + "/" + invoiceDate.getFullYear()
                var today= new Date()
                var fendDate = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
            }

            var date = new Date()
            dateGenerated = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
            fileNameDate = date.getMonth() + 1 + "_" + date.getDate() + "_" + date.getFullYear()


            var fileName = "Sales_Performance_" + fileNameDate + ".docx"

            const content = fs.readFileSync(
                path.resolve("files", "salesPerformance_template.docx"), "binary"
            );

            const zip = new PizZip(content);
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // render the document
            doc.render({
                dateGenerated: dateGenerated,
                startDate:fstartDate,
                endDate:fendDate,
                items: formattedInventory,
                overallTotal: "₱ " + numberWithCommas(parseFloat(overallTotal).toFixed(2))
            });

            const buf = doc.getZip().generate({ type: "nodebuffer" });

            if (!fs.existsSync(path.resolve('documents')))
                fs.mkdirSync('documents');

            fs.writeFileSync(path.resolve("documents", fileName), buf);

            res.send(fileName)

        }

        getInformation();
    },

    exportPurchases: function(req, res) {
         async function getInfo() {

            var today = new Date().toLocaleString('en-US');
            var temp_purchases = await getPurchases();
            var purchases = [];
            var total =0;

            var startDate = req.query.startDate
            var endDate = req.query.endDate

            //there is date filter
            if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                startDate = new Date(req.query.startDate)
                endDate = new Date(req.query.endDate)
                startDate.setHours(0,0,0,0);
                endDate.setHours(0,0,0,0);

                var fstartDate = startDate.getMonth() + 1 + "/" + startDate.getDate() + "/" + startDate.getFullYear()
                var fendDate = endDate.getMonth() + 1 + "/" + endDate.getDate() + "/" + endDate.getFullYear()
            }   

            for (var i=0; i<temp_purchases.length; i++) {
                var dateMade = new Date(temp_purchases[i].date);
                var dateReceived = new Date(temp_purchases[i].dateReceived)

                var purchase = {
                    dateMade: dateMade.getMonth() + 1 + "/" + dateMade.getDate() + "/" + dateMade.getFullYear(),
                    poNumber: temp_purchases[i].purchaseOrderNumber,
                    supplier: await getSupplierName(temp_purchases[i].supplierID),
                    dateReceived: dateReceived.getMonth() + 1 + "/" + dateReceived.getDate() + "/" + dateReceived.getFullYear(),
                    amountPaid: "₱ " + numberWithCommas(temp_purchases[i].total.toFixed(2))
                };


                //there is date filter
                if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                    if (!(startDate > dateMade || dateMade > endDate)) {
                        purchases.push(purchase);
                        total += parseFloat(temp_purchases[i].total);
                    }
                }

                else {
                    purchases.push(purchase);
                    total += parseFloat(temp_purchases[i].total);
                }
            }

            var date = new Date()
            dateGenerated = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
            fileNameDate = date.getMonth() + 1 + "_" + date.getDate() + "_" + date.getFullYear()

            //no date filter, base start and end date on invoices
            if ((startDate == null || startDate == "") || (endDate == null || endDate == "")) {
                var fstartDate = purchases[0].dateMade
                var today= new Date()
                var fendDate = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
            }
            
            var fileName = "Purchases_" + fileNameDate + ".docx"

            const content = fs.readFileSync(
                path.resolve("files", "purchaseReport_template.docx"), "binary"
            );

            const zip = new PizZip(content);
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // render the document
            doc.render({
                dateGenerated: dateGenerated,
                startDate: fstartDate,
                endDate: fendDate,
                po: purchases,
                totalPurchase: "₱ " + numberWithCommas(parseFloat(total).toFixed(2))
            });

            const buf = doc.getZip().generate({ type: "nodebuffer" });

            if (!fs.existsSync(path.resolve('documents')))
                fs.mkdirSync('documents');

            fs.writeFileSync(path.resolve("documents", fileName), buf);

            res.send(fileName)

        }

        getInfo();
    },

    exportInventoryPerformance: function(req, res) {
        function getItemCategory(itemID) {
            return new Promise((resolve, reject) => {
                db.findOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'categoryID', function(result) {
                    resolve(result);
                });
            });
        }

        function getRetailQuantity(itemID) {
            return new Promise((resolve, reject) => {
                db.findOne(Items, {_id:itemID, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'retailQuantity', function (result) {
                    resolve(result.retailQuantity)
                })
            })
        }

        async function convert(itemID, invoiceQuantity) {
            var retailQuantity = await getRetailQuantity(itemID);
            console.log(retailQuantity)
            var convertedQuantity = invoiceQuantity/retailQuantity;
            return parseFloat(convertedQuantity);
        }
        
        async function getInformation() {
            var startDate = req.query.startDate
            var endDate = req.query.endDate

            var today = new Date().toLocaleString('en-US');
            var allInventory = await getAllInventoryItems();
            var inventory = await filterInventory(allInventory);    //inventory items with no duplicate
            var formattedInventory = [];
            var categories = await getItemCategories();
            var invoiceItems = await getAllInvoiceItems();

            var paidStatus = await getSpecificInvoiceStatusID("Paid");

            //there is date filter
            if ((startDate != null && startDate!="") || (endDate != null && endDate!="")) {
                startDate = new Date(req.query.startDate)
                endDate = new Date(req.query.endDate)
                startDate.setHours(0,0,0,0);
                endDate.setHours(0,0,0,0);

                var fstartDate = startDate.getMonth() + 1 + "/" + startDate.getDate() + "/" + startDate.getFullYear()
                var fendDate = endDate.getMonth() + 1 + "/" + endDate.getDate() + "/" + endDate.getFullYear()
            }    


            for (var a=0; a<categories.length; a++) {
                console.log(categories[a])
                var categoryItems = [];

                var itemCount = 0;

                for (var j = 0; j < inventory.length; j++) {
                    var unitsSold = 0;

                    if (categories[a]._id == inventory[j].categoryID) {

                        // get number of units sold
                        for (var k = 0 ; k < invoiceItems.length; k++) {

                            var itemUnitInfo = await getItemUnitInfo(invoiceItems[k].itemUnitID);

                                if (await getItemDescription(itemUnitInfo.itemID) == inventory[j].itemDescription && (await checkInvoicePaid(invoiceItems[k].invoice_id) == paidStatus)) {
                                    //no need conversion
                                    if (itemUnitInfo.unitID == inventory[j].unitID)
                                        unitsSold += parseFloat(invoiceItems[k].quantity);
                                    else
                                        unitsSold += await convert(itemUnitInfo.itemID, invoiceItems[k].quantity);
                                }
                        }

                        var item = {
                            rank: 1,
                            description: inventory[j].itemDescription,
                            unitsSold: parseFloat(unitsSold).toFixed(2),
                            UOM: await getSpecificUnit(inventory[j].unitID)
                        };
                        categoryItems.push(item);
                    }
                }

                categoryItems.sort((a, b) => (a.unitsSold > b.unitsSold) ? -1 : 1);

                for (var y=0; y<categoryItems.length; y++) {
                    categoryItems[y].rank = y + 1;
                    //console.log(toBeArranged[y]);
                }   


                var category = {
                    categoryName: categories[a].category,
                    items: categoryItems
                }
                formattedInventory.push(category)
            }

            var date = new Date()
            dateGenerated = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear()
            fileNameDate = date.getMonth() + 1 + "_" + date.getDate() + "_" + date.getFullYear()

            //no date filter, base start and end date on invoices
            if ((startDate == null || startDate == "") || (endDate == null || endDate == "")) {
                var invoiceDate = new Date(await getInvoiceDate(invoiceItems[0].invoice_id))
                var fstartDate = invoiceDate.getMonth() + 1 + "/" + invoiceDate.getDate() + "/" + invoiceDate.getFullYear()
                var today= new Date()
                var fendDate = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
            }

        
            var fileName = "Inventory_Performance" + fileNameDate + ".docx"

            const content = fs.readFileSync(
                path.resolve("files", "inventoryPerformance_template.docx"), "binary"
            );

            const zip = new PizZip(content);
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });


            console.log(formattedInventory)
            // render the document
            doc.render({
                dateGenerated: dateGenerated,
                startDate: fstartDate,
                endDate: fendDate,
                categories: formattedInventory
            });

            const buf = doc.getZip().generate({ type: "nodebuffer" });

            if (!fs.existsSync(path.resolve('documents')))
                fs.mkdirSync('documents');

            fs.writeFileSync(path.resolve("documents", fileName), buf);

            console.log(fileName)

            res.send(fileName)
        }

        getInformation();
    }
};

module.exports = reportController;