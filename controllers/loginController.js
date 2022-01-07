// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const bcrypt = require('bcrypt');

const Employees = require('../models/EmployeeModel.js');

var session = require('express-session');

require('../controllers/helpers.js')();

const loginController = {

	getLogin: function (req, res) {
		var saltRounds = 10;
		var password = "password";

		/*bcrypt.hash(password, saltRounds, (err, hash) => {
			// Now we can store the password hash in db.
			console.log(hash);
			
			db.updateMany(Employees, {}, {$set: {password: hash}}, function(result) {
			});
		});*/

		res.render('login');
	},

    logout: function (req, res) {
        req.session.destroy(function(err) {
            if(err) throw err;
			res.send({redirect: '/login'});
        });
    },

	checkLogIn: function(req, res){
		var username = req.body.username;
		var password = req.body.password;

		console.log(username + " " + password);

		async function redirect () {
			var employee = await getEmployeeInfoFromUsername(username);

			if (employee != null && employee.username == username) {
				var equalVal = await checkPassword(password, employee.password);

				if (equalVal) {
					req.session._id = employee._id;
					req.session.name = employee.name;
					req.session.username = employee.username;
					req.session.positionID = employee.positionID;
					req.session.position = await getPositionName(req.session.positionID);
						
					if ("Manager" == req.session.position)
						res.send({redirect: '/invoices'}); // change manager landing page
					else if ("Cashier" == req.session.position)
						res.send({redirect: '/invoices'});
					else if ("Inventory and Purchasing" == req.session.position)
						res.send({redirect: '/inventory'});
					else if ("Delivery" == req.session.position)
						res.send({redirect: '/deliveries'});
				}
				else
				{
					res.send(null);
				}
			} else {
				res.send(null);
			}
		}
		redirect();
	}
};


module.exports = loginController;