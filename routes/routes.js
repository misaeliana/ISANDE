// import module `express`
const express = require('express');

const router = express.Router();

const customerController = require('../controllers/customerController.js');

//--CUSTOMER--

router.get('/customerList', customerController.getCustomerList);

router.post('/postCustomerInformation', customerController.postCustomerInformation);

router.get('/getCheckCustomerName', customerController.checkCustomerName);

router.get('/customer/:customerID', customerController.getViewCustomer);

router.post('/postUpdateCustomerInformation', customerController.postUpdateInformation);

router.post('/deleteCustomer', customerController.deleteCustomer);

module.exports = router;