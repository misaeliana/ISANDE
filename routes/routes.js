// import module `express`
const express = require('express');

const router = express.Router();

const customerController = require('../controllers/customerController.js');

const employeeController = require('../controllers/employeeController.js');

const inventoryController = require('../controllers/inventoryController.js');

const purchaseOrderController = require('../controllers/purchaseOrderController.js');

//--CUSTOMER--

router.get('/customerList', customerController.getCustomerList);

router.post('/postCustomerInformation', customerController.postCustomerInformation);

router.get('/getCheckCustomerName', customerController.checkCustomerName);

router.get('/customer/:customerID', customerController.getViewCustomer);

router.post('/postUpdateCustomerInformation', customerController.postUpdateInformation);

router.post('/deleteCustomer', customerController.deleteCustomer);


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

router.get('/getCheckItemDescription', inventoryController.getCheckItemDescription);

router.get('/inventory/:itemID', inventoryController.getViewItem);

router.post('/postUpdateItemInformation', inventoryController.postUpdateItemInformation);

router.post('/postAddItemSupplier', inventoryController.postAddItemSupplier);

router.get('/editItemSuppliers/:itemID', inventoryController.editItemSuppliers);


//--PURCHASE ORDER--
router.get('/purchaseOrderList', purchaseOrderController.getPurchaseOrderList);

router.get('/newPurchaseOrder', purchaseOrderController.getCreateNewPurchaseOrder);

router.get('/generatePurchaseOrder', purchaseOrderController.generatePurchaseOrder);

router.get('/getItemNamePO', purchaseOrderController.getItems);

router.post('/saveNewPO', purchaseOrderController.saveNewPO);

router.get('/purchaseOrder/:poID', purchaseOrderController.getPurchaseOrder);

router.post('/saveGeneratePurchaseOrder', purchaseOrderController.saveGeneratePurchaseOrder)



module.exports = router;