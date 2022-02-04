// import module `express`
const express = require('express');

const router = express.Router();

const controller = require('../controllers/controller.js');

const customerController = require('../controllers/customerController.js');

const employeeController = require('../controllers/employeeController.js');

const inventoryController = require('../controllers/inventoryController.js');

const purchaseOrderController = require('../controllers/purchaseOrderController.js');

const invoiceController = require('../controllers/invoiceController.js');

const supplierController = require('../controllers/supplierController.js');

const manualCountController = require('../controllers/manualCountController.js');

const reportController = require('../controllers/reportController.js');

const loginController = require('../controllers/loginController.js');

router.get('/favicon.ico', controller.getFavicon);

router.get('/', controller.getIndex);

router.get('/documents/:fileName', controller.download)

//--ACCOUNT--
router.get('/login', loginController.getLogin);

router.post('/checkLogIn', loginController.checkLogIn);

router.get('/logout', loginController.logout);

router.get('/dashboard', loginController.getDashboard);

//--CUSTOMER--

router.get('/customers', customerController.getCustomerList);

router.post('/postCustomerInformation', customerController.postCustomerInformation);

router.get('/getCheckCustomerName', customerController.checkCustomerName);

router.get('/customer/:customerID', customerController.getViewCustomer);

router.post('/postUpdateCustomerInformation', customerController.postUpdateInformation);

router.post('/deleteCustomer', customerController.deleteCustomer);

router.post('/payAccount', customerController.payAccount);

router.get('/checkPendingInvoices', customerController.checkPendingInvoices);

//--SUPPLIER--

router.get('/suppliers', supplierController.getSupplierList);

router.post('/postSupplierInformation', supplierController.postSupplierInformation);

router.get('/getCheckSupplierName', supplierController.checkSupplierName);

router.get('/supplier/:supplierID', supplierController.getViewSupplier);

router.post('/postUpdateSupplierInformation', supplierController. postUpdateInformation);

router.post('/deleteSupplier', supplierController.deleteSupplier);

//router.post('/addSupplierItem', supplierController.addSupplierItem);

router.get('/getAllItemName', supplierController.getItems);

router.get('/checkPendingPO', supplierController.checkPendingPO);

router.post('/deleteSupplierPO', supplierController.deleteSupplierPO);

router.get('/editSupplierItems/:supplierID', supplierController.editSupplierItems)

router.get('/checkForPendingPOSuppliers', supplierController.checkForPendingPOSuppliers);

router.post('/updateSupplierItems', supplierController.updateSupplierItems)


//--EMPLOYEE--

router.get('/employees', employeeController.getEmployeeList);

router.post('/postEmployeeInformation', employeeController.postEmployeeInformation);

router.get('/getCheckEmployeeName', employeeController.checkEmployeeName);

router.get('/getCheckEmployeeUsername', employeeController.checkEmployeeUsername);

router.get('/employee/:employeeID', employeeController.getViewEmployee);

router.post('/postUpdateEmployeeInformation', employeeController.postUpdateInformation);

router.post('/deleteEmployee', employeeController.deleteEmployee);


//--INVENTORY--
router.get('/inventory', inventoryController.getInventoryList);

router.post('/postNewItem', inventoryController.postNewItem);

router.get('/getCheckItemDescription', inventoryController.getCheckItemDescription);

router.get('/inventory/:itemID', inventoryController.getViewItem);

router.post('/postUpdateItemInformation', inventoryController.postUpdateItemInformation);

router.get('/editItemSuppliers/:itemID', inventoryController.editItemSuppliers);

router.get('/checkForPendingPOInventory', inventoryController.checkForPendingPO);

router.post('/updateItemSuppliers', inventoryController.postUpdateItemSuppliers);

router.get('/getSearchInventory', inventoryController.getSearchInventory);

router.get('/getFilterInventory', inventoryController.getFilterInventory);

router.post('/deleteSellingUnit', inventoryController.deleteSellingUnit);

router.post('/editSellingUnit', inventoryController.editSellingUnit);

router.get('/getLastestPrices', inventoryController.getLastestPrices)


//--PURCHASE ORDER--
router.get('/purchaseOrders', purchaseOrderController.getPurchaseOrderList);

router.get('/newPurchaseOrder', purchaseOrderController.getCreateNewPurchaseOrder);

router.get('/generatePurchaseOrder', purchaseOrderController.generatePurchaseOrder);

router.get('/getItemNamePO', purchaseOrderController.getItems);

//router.get('/getItemUnit', purchaseOrderController.getItemUnit);

router.get('/getEOQ', purchaseOrderController.getEOQ);

router.get('/previousPONumber', purchaseOrderController.previousPONumber);

router.post('/saveNewPO', purchaseOrderController.saveNewPO);

router.get('/purchaseOrder/:poID', purchaseOrderController.getPurchaseOrder);

router.post('/addItemSupplier', purchaseOrderController.addItemSupplier);

router.post('/saveGeneratePurchaseOrder', purchaseOrderController.saveGeneratePurchaseOrder);

router.get('/editPO/:poID', purchaseOrderController.editPO);

router.get('/getSupplierName', purchaseOrderController.getSupplierName);

router.get('/getSupplierInformation', purchaseOrderController.getSupplierInformation);

router.get('/isSold', purchaseOrderController.isSold);

router.post('/updatePOItems', purchaseOrderController.updatePOItems);

router.post('/updatePOStatus', purchaseOrderController.updatePOStatus);

router.post('/updatePOWithPrice', purchaseOrderController.updatePOWithPrice);

router.get('/getItemSuppliers', purchaseOrderController.getItemSuppliers);

router.post('/deletePO', purchaseOrderController.deletePO);

router.post('/cancelPO', purchaseOrderController.cancelPO);

router.get('/exportPO', purchaseOrderController.generateDocument);

//--INVOICE--
router.get('/invoices', invoiceController.getInvoiceList);

router.get('/invoices/:invoiceID', invoiceController.getViewSpecificInvoice);

router.get('/newInvoice', invoiceController.getNewInvoice);

router.post('/createNewInvoice', invoiceController.addNewInvoice);

router.get('/getItemPrice', invoiceController.getItemPrice);

router.get('/getFilteredRowsInvoice', invoiceController.getFilteredRowsInvoice);

router.get('/getSearchInvoice', invoiceController.getSearchInvoice);

router.get('/getCustomerName', invoiceController.getCustomerName);

router.get('/getCustomerInformation', invoiceController.getCustomerInformation);

router.get('/getCustomerAddressTitles', invoiceController.getCustomerAddressTitles);

router.get('/getCustomerAddress', invoiceController.getCustomerAddress)

router.get('/getItemName', invoiceController.getItems);

router.get('/getCustomerList', invoiceController.getCustom);

router.get('/return/:invoiceID', invoiceController.returns);

router.get('/checkQuantity', invoiceController.checkQuantity);

router.get('/getItemInfo', invoiceController.getItemInfo);

router.post('/saveReturn', invoiceController.saveReturn);

router.post('/payOneInvoice', invoiceController.payOneInvoice);

router.get('/exportInvoice', invoiceController.exportInvoice);

router.get('/getCheckCustomerNameInvoice', invoiceController.getCheckCustomerName);

router.get('/getCheckItemExists', invoiceController.getCheckItemExists)


//--DELIVERY--
router.get('/deliveries', invoiceController.getDeliveryList);

router.get('/deliveries/:deliveryID', invoiceController.getDeliveryInfo);

router.get('/getSearchDeliveryList', invoiceController.getSearchDeliveryList);

router.post('/postUpdateDelivery', invoiceController.postUpdateDelivery);


//--MANUAL COUNT--
router.get('/manualCount', manualCountController.getManualCount);

router.post('/updateManualCount', manualCountController.updateManualCount);

router.get('/shrinkages', manualCountController.getShrinkages);

router.get('/getSearchShrinkages', manualCountController.getSearchShrinkages);

router.get('/getFilteredRowsShrinkages', manualCountController.getFilteredRowsShrinkages);

//--REPORTS--
router.get('/salesReport', reportController.getSalesReport);

router.get('/getFilteredSalesReport', reportController.getFilteredSalesReport);

router.get('/getDateToday', reportController.getDateToday);

router.get('/inventoryPerformanceReport', reportController.getInventoryPerformanceReport);

router.get('/getFilteredInventoryPerformanceReport', reportController.getFilteredInventoryPerformanceReport)

router.get('/salesPerformanceReport', reportController.getSalesPerformanceReport);

router.get('/getFilteredSalesPerformanceReport', reportController.getFilteredSalesPerformanceReport);

router.get('/purchaseReport', reportController.getPurchaseReports);

router.get('/getFilteredPurchaseReport', reportController.getFilteredPurchaseReport);

router.get('/salesPerCustomer', reportController.getSalesPerCustomer);

router.get('/getCustomerInvoices', reportController.getCustomerInvoicesReport);

router.get('/getFilteredCustomerInvoices', reportController.getFilteredCustomerInvoices);

router.get('/exportSalesPerCustomer', reportController.exportSalesPerCustomer);

router.get('/exportSales', reportController.exportSales)

router.get('/exportSalesPerformance', reportController.exportSalesPerformance)

router.get('/exportPurchases', reportController.exportPurchases)

//NEW STUFF

router.get('/checkSellingUnit', inventoryController.checkSellingUnit)

router.post('/newSellingUnit', inventoryController.newSellingUnit);

router.get('/getItemUnitsInvoice', invoiceController.getItemUnits);

router.get('/getItemUnitsPO', purchaseOrderController.getItemUnitsPO);



module.exports = router;