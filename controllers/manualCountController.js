// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Shrinkages = require('../models/ShrinkagesModel.js');

require('../controllers/helpers.js');

const manualCountController = {

	getManualCount: function(req, res) {

		async function getInformation() {
            var inventoryTypes = await getInventoryTypes();
            var shrinkageReasons = await getshrinkageReasons();
            var informationStatusID = await getInformationStatus("Active");
            var inventoryItems = await getInventoryItems(informationStatusID);
            var items = [];

            for (var i = 0; i < inventoryItems.length; i++) {
                var item = {
                    _id: inventoryItems[i]._id,
                    itemDescription: inventoryItems[i].itemDescription,
                    quantityAvailable: inventoryItems[i].quantityAvailable,
                    unit: await getSpecificUnit(inventoryItems[i].unitID),
                    category: inventoryItems[i].categoryID,
                    reasons: shrinkageReasons,
                };

                items.push(item);

            }

			res.render('updateManualCount', {inventoryTypes, items});
		}

		getInformation();

    },
    
    updateManualCount: function(req, res) {
        var shrinkages = JSON.parse(req.body.JSONShrinkages);

        async function updateItem() {

            // subtract from inventory 
            for (var i = 0; i < shrinkages.length; i++) {

                var item = await getItemInfo(shrinkages[i].itemID);

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
        async function getInformation() {
            var shrinkagesInfo = [];
            var shrinkages = await getShrinkages();

            for (var i = 0; i < shrinkages.length; i++) {
                var date = new Date(shrinkages[i].date);
                var item = await getItemInfo(shrinkages[i].itemID);

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


			res.render('shrinkagesList', {shrinkagesInfo});
		}

		getInformation();
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