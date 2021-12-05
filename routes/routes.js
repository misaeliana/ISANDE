// import module `express`
const express = require('express');

const router = express.Router();

const customerController = require('../controllers/customerController.js');

const employeeController = require('../controllers/employeeController.js');

const inventoryController = require('../controllers/inventoryController.js');

const purchaseOrderController = require('../controllers/purchaseOrderController.js');

const invoiceController = require('../controllers/invoiceController.js');
const supplierController = require('../controllers/supplierController.js');

//--CUSTOMER--

router.get('/customerList', customerController.getCustomerList);

router.post('/postCustomerInformation', customerController.postCustomerInformation);

router.get('/getCheckCustomerName', customerController.checkCustomerName);

router.get('/customer/:customerID', customerController.getViewCustomer);

router.post('/postUpdateCustomerInformation', customerController.postUpdateInformation);

router.post('/deleteCustomer', customerController.deleteCustomer);

//--SUPPLIER--

router.get('/supplierList', supplierController.getSupplierList);

router.post('/postSupplierInformation', supplierController.postSupplierInformation);

router.get('/getCheckSupplierName', supplierController.checkSupplierName);

router.get('/supplier/:supplierID', supplierController.getViewSupplier);

router.post('/postUpdateSupplierInformation', supplierController. postUpdateInformation);

router.post('/deleteSupplier', supplierController.deleteSupplier);

//--EMPLOYEE--

router.get('/employeeList', employeeController.getEmployeeList);

router.post('/postEmployeeInformation', employeeController.postEmployeeInformation);

router.get('/getCheckEmployeeName', employeeController.checkEmployeeName);

router.get('/getCheckEmployeeUsername', employeeController.checkEmployeeUsername);

router.get('/employee/:employeeID', employeeController.getViewEmployee);

router.post('/postUpdateEmployeeInformation', employeeController.postUpdateInformation);

router.post('/deleteEmployee', employeeController.deleteEmployee);


//--INVENTORY--
router.get('/inventory', inventoryController.getInventoryList);

router.post('/postNewItem', inventoryController.postNewItem);

//router.get('/getCheckItemDescription', inventoryController.getCheckItemDescription);

router.get('/inventory/:itemID', inventoryController.getViewItem);

router.post('/postUpdateItemInformation', inventoryController.postUpdateItemInformation);

router.get('/editItemSuppliers/:itemID', inventoryController.editItemSuppliers);

router.post('/updateItemSuppliers', inventoryController.postUpdateItemSuppliers);

router.get('/getSearchInventory', inventoryController.getSearchInventory);

router.get('/getFilterInventory', inventoryController.getFilterInventory);


//--PURCHASE ORDER--
router.get('/purchaseOrderList', purchaseOrderController.getPurchaseOrderList);

router.get('/newPurchaseOrder', purchaseOrderController.getCreateNewPurchaseOrder);

router.get('/generatePurchaseOrder', purchaseOrderController.generatePurchaseOrder);

router.get('/getItemNamePO', purchaseOrderController.getItems);

router.get('/getItemUnit', purchaseOrderController.getItemUnit);

router.get('/previousPONumber', purchaseOrderController.previousPONumber);

router.post('/saveNewPO', purchaseOrderController.saveNewPO);

router.get('/purchaseOrder/:poID', purchaseOrderController.getPurchaseOrder);

router.post('/saveGeneratePurchaseOrder', purchaseOrderController.saveGeneratePurchaseOrder);

router.get('/editPO/:poID', purchaseOrderController.editPO);

router.get('/getSupplierName', purchaseOrderController.getSupplierName);

router.get('/getSupplierInformation', purchaseOrderController.getSupplierInformation)

router.get('/isSold', purchaseOrderController.isSold);

router.post('/updatePOItems', purchaseOrderController.updatePOItems);

router.post('/updatePOStatus', purchaseOrderController.updatePOStatus);

router.post('/updatePOWithPrice', purchaseOrderController.updatePOWithPrice);

router.get('/getItemSuppliers', purchaseOrderController.getItemSuppliers)

router.post('/deletePO', purchaseOrderController.deletePO)

router.post('/cancelPO', purchaseOrderController.cancelPO)

router.get('/exportPO', purchaseOrderController.generatePDF);

//--INVOICE--
router.get('/invoices', invoiceController.getInvoiceList);

router.get('/invoices/:invoiceID', invoiceController.getViewSpecificInvoice);

router.get('/newInvoice', invoiceController.getNewInvoice);

router.post('/createNewInvoice', invoiceController.addNewInvoice);

router.get('/getItemPrice', invoiceController.getItemPrice);

router.get('/getFilteredRowsInvoice', invoiceController.getFilteredRowsInvoice);

router.get('/getSearchInvoice', invoiceController.getSearchInvoice);

router.get('/getCustomerName', invoiceController.getCustomerName);

router.get('/getCustomerInformation', invoiceController.getCustomerInformation)

router.get('/getItemNameInvoice', invoiceController.getItems);

router.get('/getCustomerList', invoiceController.getCustom);

router.get('/return/:invoiceID', invoiceController.returns);

router.post('/createNewCustomer', invoiceController.addNewCustomer);

router.get('/checkQuantity', invoiceController.checkQuantity);

router.get('/getItemInfo', invoiceController.getItemInfo)

router.post('/saveReturn', invoiceController.saveReturn);


//--DELIVERY--
router.get('/deliveries', invoiceController.getDeliveryList);

router.get('/deliveries/:deliveryID', invoiceController.getDeliveryInfo);

router.get('/getSearchDeliveryList', invoiceController.getSearchDeliveryList);

router.post('/postUpdateDelivery', invoiceController.postUpdateDelivery);

module.exports = router;