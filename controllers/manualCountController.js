// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Shrinkages = require('../models/ShrinkagesModel.js');

const ItemUnits = require('../models/ItemUnitsModel.js'); 

const Items = require('../models/ItemsModel.js');

require('../controllers/helpers.js');

const manualCountController = {

	getManualCount: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
            async function getOtherUnit(inventoryItem) {
                return new Promise((resolve, reject) => {
                    db.findOne(ItemUnits, {$and: [ {itemID:inventoryItem._id}, {unitID: {$ne:inventoryItem.unitID}}, {informationStatusID:"618a7830c8067bf46fbfd4e4"}]}, 'unitID', function(result) {
                        resolve(result.unitID);
                    });
                });
            }

            async function getInformation() {
                var itemCategories = await getItemCategories();
                var shrinkageReasons = await getshrinkageReasons();
                var informationStatusID = await getInformationStatus("Active");
                var inventoryItems = await getInventoryItems(informationStatusID);
                var items = [];


                for (var i = 0; i < inventoryItems.length; i++) {

                    var item = {
                        _id: inventoryItems[i]._id,
                        itemDescription: inventoryItems[i].itemDescription,
                        quantityAvailable: Math.floor(inventoryItems[i].quantityAvailable),
                        unit: await getSpecificUnit(inventoryItems[i].unitID),
                        category: inventoryItems[i].categoryID,
                        reasons: shrinkageReasons
                    };
                    if (item.quantityAvailable>0)
                        items.push(item);

                    //quantity availbale has decimal
                    if (!Number.isInteger(inventoryItems[i].quantityAvailable)) {
                        var item = {
                            _id: inventoryItems[i]._id,
                            itemDescription: inventoryItems[i].itemDescription,
                            quantityAvailable: parseInt((inventoryItems[i].quantityAvailable - Math.floor(inventoryItems[i].quantityAvailable)) * inventoryItems[i].retailQuantity),
                            unit: await getSpecificUnit(await getOtherUnit(inventoryItems[i])),
                            category: inventoryItems[i].categoryID,
                            reasons: shrinkageReasons
                        };
                        items.push(item);
                    }
                }

                //res.render('updateManualCount', {itemCategories, items});
                
                if(req.session.position == "Inventory and Purchasing"){
                    var inventoryAndPurchasing = req.session.position;
                    res.render('updateManualCount', {itemCategories, items, inventoryAndPurchasing});	
                }

                if(req.session.position == "Manager"){
                    var manager = req.session.position;
                    res.render('updateManualCount', {itemCategories, items, manager});
                }
            }
            getInformation();
        }
    },
    
    updateManualCount: function(req, res) {
        function getItemInfo(itemID) {
            return new Promise((resolve, reject) => {
                db.findOne(Items, {_id: itemID}, '', function(result) {
                    resolve(result);
                });
            });
        }
        var shrinkages = JSON.parse(req.body.JSONShrinkages);

        async function updateItem() {

            // subtract from inventory 
            for (var i = 0; i < shrinkages.length; i++) {
                shrinkages[i].employeeID = req.session._id

                var shrinkageUnitID = await getUnitID(shrinkages[i].unit);

                var item = await getItemInfo(shrinkages[i].itemID);

                console.log(item);

                //needs conversion
                if (item.unitID!= shrinkageUnitID) {
                    var newQuantity = parseFloat(shrinkages[i].quantityLost / item.retailQuantity);
                    newQuantity = parseFloat(parseFloat(item.quantityAvailable) - parseFloat(newQuantity)).toFixed(2);

                }
                
                else
                    var newQuantity = parseFloat(item.quantityAvailable) - parseFloat(shrinkages[i].quantityLost);

                updateItemQuantity(shrinkages[i].itemID, newQuantity);
            }

            db.insertMany (Shrinkages, shrinkages, function(flag) {
                if (flag) {
                    res.send(true);
                } 
            });
        }

        updateItem();
    },
    
    getShrinkages: function(req, res) {
        if (req.session.position == null)
            res.redirect('/login')

        else if(req.session.position != "Inventory and Purchasing" && req.session.position != "Manager"){
			res.redirect('/dashboard');
		}
		else{
            async function getInformation() {
                var shrinkagesInfo = [];
                var shrinkages = await getShrinkages();

                for (var i = 0; i < shrinkages.length; i++) {
                    var date = new Date(shrinkages[i].date);
                    var itemUnit = await getItemUnitInfo(shrinkages[i].itemUnitID);

                    var shrinkage = {
                        date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                        description: await getItemDescription(itemUnit.itemID),
                        quantity: shrinkages[i].quantityLost,
                        unit: await getSpecificUnit(itemUnit.unitID),
                        reason: await getShrinkageReason(shrinkages[i].reasonID),
                        employee: await getEmployeeName(shrinkages[i].employeeID)
                    };

                    shrinkagesInfo.push(shrinkage);
                }
                //res.render('shrinkagesList', {shrinkagesInfo});
                
                if(req.session.position == "Inventory and Purchasing"){
                    var inventoryAndPurchasing = req.session.position;
                    res.render('shrinkagesList', {shrinkagesInfo, inventoryAndPurchasing});	
                }

                if(req.session.position == "Manager"){
                    var manager = req.session.position;
                    res.render('shrinkagesList', {shrinkagesInfo, manager});
                }
            }

            getInformation();
        }
    },

    getSearchShrinkages: function(req, res) {
        var searchItem = req.query.searchItem;
        
        async function getInformation() {
            var shrinkagesInfo = [];
            var foundItems = await getSearchItemShrinkage(searchItem);

            if (foundItems != null) {
                for (var i = 0; i < foundItems.length; i++) {
                    var shrinkages = await getShrinkagesFromID(foundItems[i]._id);

                    for (var j = 0; j < shrinkages.length; j++) {
                        var date = new Date(shrinkages[j].date);
                        var item = await getItemInfo(shrinkages[j].itemID);
        
                        var shrinkage = {
                            date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                            description: item.itemDescription,
                            quantity: shrinkages[j].quantityLost,
                            unit: await getSpecificUnit(item.unitID),
                            reason: await getShrinkageReason(shrinkages[j].reasonID),
                            employee: await getEmployeeName(shrinkages[j].employeeID)
                        };

                        shrinkagesInfo.push(shrinkage);
                    }
                }
            }

            console.log(shrinkagesInfo);
            res.send(shrinkagesInfo);
		}
        getInformation();
    },

    getFilteredRowsShrinkages: function(req, res) {
        var startDate = new Date(req.query.startDate);
        var endDate = new Date(req.query.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        
        async function getInformation() {
            var shrinkagesInfo = [];
            var shrinkages = await getShrinkages();

            for (var i = 0; i < shrinkages.length; i++) {
                var item = await getItemInfo(shrinkages[i].itemID);
                var date = new Date(shrinkages[i].date);
                date.setHours(0,0,0,0);
                
                if (!(startDate > date || date > endDate)) {
                    var shrinkage = {
                        date: date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),
                        description: item.itemDescription,
                        quantity: shrinkages[i].quantityLost,
                        unit: await getSpecificUnit(item.unitID),
                        reason: await getShrinkageReason(shrinkages[i].reasonID),
                        employee: await getEmployeeName(shrinkages[i].employeeID)
                    };
    
                    shrinkagesInfo.push(shrinkage);
                }
            }
            res.send(shrinkagesInfo);
        }
        getInformation();
    }
};

module.exports = manualCountController;