// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const ShrinkageReasons = require('../models/ShrinkageReasonsModel.js');

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

	}
};

module.exports = manualCountController;