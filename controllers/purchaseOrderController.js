// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Items = require('../models/ItemsModel.js');

const Suppliers = require('../models/SuppliersModel.js');

const PurchaseOrderStatus = require('../models/PurchaseOrderStatusModel.js');

const Units = require('../models/UnitsModel.js');

const Purchases = require('../models/PurchasesModel.js');

const PurchasedItems = require('../models/PurchasedItemsModel.js');


const purchaseOrderController = {

	getPurchaseOrderList: function(req, res) {


		async function getPurchaseInfo (result) {
			var purchases = []
			for (var i=0; i<result.length; i++) {
				var purchase = {
					poID: result[i]._id,
					date: result[i].date.toLocaleString('en-US'), 
					supplier: result[i].supplierID,
					amount: 0, 
					status: await getPurchaseOrderStatus(result[i].statusID)
				}
				purchases.push(purchase)
			}
			res.render('purchaseOrderList', {purchases});
		}

		db.findMany(Purchases, {}, 'date supplierID statusID', function(result) {
			getPurchaseInfo(result);
		})
		
	},

	getCreateNewPurchaseOrder: function(req, res) {
		res.render('newPO');
	},

	getItems: function(req, res) {
		db.findMany (Items, {itemDescription:{$regex:req.query.query, $options:'i'}}, 'itemDescription', function (result) {
			var formattedResults = [];
			//reason for the for loop: https://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
			for (var i=0; i<result.length; i++) {
				var formattedResult = {
					label: result[i].itemDescription,
					value: result[i].itemDescription
				};
				formattedResults.push(formattedResult);
			}
			res.send(formattedResults);
		})
	},

	saveNewPO: function(req, res) {

		async function saveItems(purchaseID, items) {
			for (var i=0; i<items.length; i++) {
				items[i].purchaseOrderID = purchaseID
				items[i].itemID = await getItemID(items[i].itemDesc);
			}

			db.insertMany(PurchasedItems, items, function(flag) {
				if (flag) {}
			})
		}

		var items = JSON.parse(req.body.itemsString);
		var date = req.body.date
		var purchase = {
			supplierID: "Hello",
			employeeID: "Hi",
			date: date,
			statusID: "618f650546c716a39100a809"
		}
		var purchaseID;
		db.insertOneResult(Purchases, purchase, function(result) {
			purchaseID = result._id;
			saveItems(purchaseID, items)
		})
	},

	getPurchaseOrder: function(req, res) {

		function getPurchasedItems (purchaseID) {
			return new Promise((resolve, reject) => {
				db.findMany(PurchasedItems, {purchaseOrderID: purchaseID}, 'itemID quantity', function(result) {
					resolve(result);
				})
			})
		}

		async function getItems(purchaseInfo) {
			var items  = await getPurchasedItems(purchaseInfo._id);
			for (var i=0; i<items.length; i++) {
				items[i].itemDescription = await getItemDescription(items[i].itemID);
			}
			res.render('viewPO', {items})
		}

		db.findOne(Purchases, {_id:req.params.poID}, '_id supplierID date statusID', function(result) {
			getItems(result)
		})
	}

}

module.exports = purchaseOrderController;