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

            // subtract from inventory won't subtract
            for (var i = 0; i < shrinkages.length; i++) {

                var item = await getItemInfo(shrinkages[i].itemID);

                var newQuantity = parseFloat(item.quantityAvailable) - parseFloat(shrinkages[i].quantityLost);

                updateItemQuantity(shrinkages[i].itemID, newQuantity);
            }

            // won't save akhdahsdfs
            db.insertMany (Shrinkages, shrinkages, function(flag) {
                if (flag) {
                    res.send(true);
                } 
            });
        }

        updateItem();
	}
};

module.exports = manualCountController;