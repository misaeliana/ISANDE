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

            console.log(inventoryItems);
            
            // itemDescription
            // systemCount
            // unit
            // reasons

			res.render('updateManualCount', {inventoryTypes, shrinkageReasons, inventoryItems});
		}

		getInformation();

	}
};

module.exports = manualCountController;