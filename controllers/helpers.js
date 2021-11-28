// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Employees = require('../models/EmployeeModel.js');

const EmployeePositions = require('../models/EmployeePositionsModel.js');

const InventoryTypes = require('../models/InventoryTypeModel.js');

const Items = require('../models/ItemsModel.js');

const ItemStatuses = require('../models/ItemStatusModel.js');

const Units = require('../models/UnitsModel.js');

const PurchaseOrderStatus = require('../models/PurchaseOrderStatusModel.js');

const InformationStatus = require('../models/InformationStatusModel.js');

const Suppliers = require('../models/SuppliersModel.js');

const ItemSuppliers = require('../models/ItemSuppliersModel.js');

const Invoices = require('../models/InvoiceModel.js');

const InvoiceTypes = require('../models/InvoiceTypesModel.js');

const InvoiceStatus = require('../models/InvoiceStatusModel.js');

const InvoiceItems = require('../models/InvoiceItemsModel.js');

const Customers = require('../models/CustomersModel.js');

const Deliveries = require('../models/DeliveriesModel.js');

module.exports = function() {
	this.getAllPositions = function() {
		return new Promise((resolve, reject) => {
			db.findMany(EmployeePositions, {}, '_id position', function (result) {
				resolve (result);
			});
		});
	},

	this.getPositionName = function(positionID) {
		return new Promise((resolve, reject) => {
			db.findOne (EmployeePositions, {_id:positionID}, 'position', function(result) {
				resolve(result.position);
			});
		});
	},

	this.getEmployees = function() {
		return new Promise((resolve, reject) => {
			db.findMany(Employees, {informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name positionID number', function(result) {
				resolve (result);
			});
		});
	},

	this.getEmployeeInfo = function(employeeID) {
		return new Promise((resolve, reject) => {
			db.findOne(Employees, {_id: employeeID}, '_id name username number position', function(result) {
				resolve (result);
			});
		});
	},

	this.getEmployeeName = function(employeeID) {
		return new Promise((resolve, reject) => {
			db.findOne(Employees, {_id: employeeID}, 'name', function(result) {
				resolve (result.name);
			});
		});
	},

	this.getInventoryTypes = function() {
		return new Promise((resolve, reject) => {
			db.findMany(InventoryTypes, {}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificInventoryType = function(inventoryTypeID) {
		return new Promise((resolve, reject) => {
			db.findOne(InventoryTypes, {_id:inventoryTypeID}, 'type', function(result) {
				resolve (result.type);
			});
		});
	},

	this.getInventoryItems = function(informationStatus) {
		return new Promise((resolve, reject) => {
			db.findMany(Items, {informationStatusID: informationStatus}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getInventoryItemsStatusFilter = function(statusID, informationStatus) {
		return new Promise((resolve, reject) => {
			db.findMany(Items, {statusID: statusID, informationStatusID: informationStatus}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getInventoryItemsTypeFilter = function(categoryID, informationStatus) {
		return new Promise((resolve, reject) => {
			db.findMany(Items, {categoryID: categoryID, informationStatusID: informationStatus}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getInventoryItemsStatusTypeFilter = function(statusID, categoryID, informationStatus) {
		return new Promise((resolve, reject) => {
			db.findMany(Items, {statusID: statusID, categoryID: categoryID, informationStatusID: informationStatus}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificInventoryItems = function(itemID) {
		return new Promise((resolve, reject) => {
			db.findOne(Items, {_id: itemID}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getUnits = function() {
		return new Promise((resolve, reject) => {
			db.findMany(Units, {}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificUnit = function(unitID) {
		return new Promise((resolve, reject) => {
			db.findOne(Units, {_id: unitID}, 'unit', function(result) {
				resolve (result.unit);
			});
		});
	},

	this.getUnitID = function(unitName) {
		return new Promise((resolve, reject) => {
			db.findOne(Units, {unit:unitName}, '_id', function(result) {
				resolve(result._id);
			});
		});
	},

	this.getItemStatuses = function() {
		return new Promise((resolve, reject) => {
			db.findMany(ItemStatuses, {}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificItemStatusID = function(itemStatus) {
		return new Promise((resolve, reject) => {
			db.findOne(ItemStatuses, {status: itemStatus}, '_id', function(result) {
				resolve (result._id);
			});
		});
	},

	this.changeItemInformationStatus = function(itemID, infoStatusID) {
		return new Promise((resolve, reject) => {
			db.updateOne(Items, {_id: itemID}, {$set: {informationStatusID: infoStatusID}}, function(flag) {
				resolve (flag);
			});
		});
	},

	this.getSpecificItemStatus = function(itemStatusID) {
		return new Promise((resolve, reject) => {
			db.findOne(ItemStatuses, {_id:itemStatusID}, 'status', function(result) {
				resolve (result.status);
			});
		});
	},

	this.getItemID = function(itemDescription) {
		return new Promise((resolve, reject) => {
			db.findOne(Items, {itemDescription:itemDescription}, '_id', function(result) {
				resolve(result._id);
			});
		});
	},

	this.getItemDescription = function(itemID) {
		return new Promise((resolve, reject) => {
			db.findOne(Items, {_id:itemID}, 'itemDescription', function(result) {
				resolve(result.itemDescription);
			});
		});
	},

	this.getInventoryItemsFromDescription = function(description, status) {
		return new Promise((resolve, reject) => {
			db.findMany(Items, {itemDescription:{$regex: description, $options:'i'}, informationStatusID: status}, '', function(result) {
				resolve(result);
			});
		});
	},

	this.getPurchaseOrderStatus = function(statusID) {
		return new Promise((resolve, reject) => {
			db.findOne(PurchaseOrderStatus, {_id: statusID}, 'purchaseOrderStatus', function(result) {
				resolve (result.purchaseOrderStatus);
			});
		});
	},

	this.getAllPurchaseOrderStatus = function() {
		return new Promise((resolve, reject) => {
			db.findMany(PurchaseOrderStatus, {}, 'purchaseOrderStatus', function(result) {
				resolve(result);
			});
		});
	},

	this.getInformationStatus = function(infoStatus) {
		return new Promise((resolve, reject) => {
			db.findOne(InformationStatus, {informationStatus: infoStatus}, '_id', function(result) {
				resolve (result._id);
			});
		});
	},

	this.getSuppliers = function() {
		return new Promise((resolve, reject) => {
			db.findMany(Suppliers,{informationStatusID:"618a7830c8067bf46fbfd4e4"}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificSupplier = function(supplierID) {
		return new Promise((resolve, reject) => {
			db.findOne(Suppliers, {_id: supplierID}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSupplierName = function(supplierID) {
		return new Promise((resolve, reject) => {
			db.findOne(Suppliers, {_id: supplierID}, 'name', function(result) {
				resolve (result.name);
			});
		});
	},

	this.getSupplierID = function(supplierName) {
		return new Promise((resolve, reject) => {
			db.findOne(Suppliers, {name: supplierName}, '', function(result) {
				resolve (result._id);
			});
		});
	},

	this.getItemSuppliers = function(itemID) {
		return new Promise((resolve, reject) => {
			db.findMany(ItemSuppliers, {itemID: itemID}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.deleteItemSuppliers = function(itemID) {
		return new Promise((resolve, reject) => {
			db.deleteMany(ItemSuppliers, {itemID: itemID}, function(flag) {
				resolve (flag);
			});
		});
	},

	this.getInvoices = function() {
		return new Promise((resolve, reject) => {
			db.findMany(Invoices, {}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificInvoice = function(invoiceID) {
		return new Promise((resolve, reject) => {
			db.findOne(Invoices, {invoiceID: invoiceID}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getCustomerIDs = function(customerName) {
		return new Promise((resolve, reject) => {
			db.findMany (Customers, {name:{$regex: customerName, $options:'i'}}, '', function (result) {
				resolve(result);
			});
		});
	},

	this.getCustomerInvocies = function(customerID) {
		return new Promise((resolve, reject) => {
			db.findMany (Invoices, {customerID: customerID}, '', function (result) {
				resolve(result);
			});
		});
	},

	this.getSpecificCustomer = function(customerID) {
		return new Promise((resolve, reject) => {
			db.findOne(Customers, {_id: customerID}, 'name', function(result) {
				resolve (result.name);
			});
		});
	},

	this.getCustomerInfo = function(customerID) {
		return new Promise((resolve, reject) => {
			db.findOne(Customers, {_id: customerID}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificInvoiceType = function(invoiceTypeID) {
		return new Promise((resolve, reject) => {
			db.findOne(InvoiceTypes, {_id: invoiceTypeID}, 'type', function(result) {
				resolve (result.type);
			});
		});
	},

	this.getSpecificInvoiceStatus = function(statusID) {
		return new Promise((resolve, reject) => {
			db.findOne(InvoiceStatus, {_id: statusID}, 'status', function(result) {
				resolve (result.status);
			});
		});
	},

	this.getInvoice = function(_id) {
		return new Promise((resolve, reject) => {
			db.findOne(Invoices, {_id: _id}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getInvoiceItems = function(_id) {
		return new Promise((resolve, reject) => {
			db.findMany(InvoiceItems, {invoice_id: _id}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getDeliveryInformation = function(invoice_id) {
		return new Promise((resolve, reject) => {
			db.findOne(Deliveries, {invoice_id: invoice_id}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getDeliveries = function() {
		return new Promise((resolve, reject) => {
			db.findMany(Deliveries, {dateDelivered: null}, '', function(result) {
				resolve (result);
			});
		});
	},

	this.getSpecificDelivery = function(deliveryID) {
		return new Promise((resolve, reject) => {
			db.findOne(Deliveries, {_id: deliveryID}, '', function(result) {
				resolve (result);
			});
		});
	}

	this.getAllInvoiceTypes = function() {
		return new Promise((resolve, reject) => {
			db.findMany(InvoiceTypes, {}, 'type', function(result) {
				resolve(result);
			});
		});
	}		
};