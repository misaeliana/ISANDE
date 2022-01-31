// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const bcrypt = require('bcrypt');

const Employees = require('../models/EmployeeModel.js');

var session = require('express-session');

require('../controllers/helpers.js')();

const loginController = {

	getLogin: function (req, res) {
		/*var saltRounds = 10;
		var password= "password"

		bcrypt.hash(password, saltRounds, (err, hash) => {
			var employee = {
				name: "Annie Smith",
				username: "Smith",
				password: hash,
				number: "0923453423453",
				positionID:"6187b8cc680957078c8b52e9",
				informationStatusID:"618a7830c8067bf46fbfd4e4"
			}
			db.insertOne(Employees, employee, function(flag) {
			
			})
		})*/

		/*var saltRounds = 10;
		var password = "password";

		bcrypt.hash(password, saltRounds, (err, hash) => {
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
				res.redirect('/login');
        });
    },

	checkLogIn: function(req, res){
		var username = req.body.username;
		var password = req.body.password;

		//console.log(username + " " + password);

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
						
					/*if ("Manager" == req.session.position)
						res.send({redirect: '/invoices'}); // change manager landing page
					else if ("Cashier" == req.session.position)
						res.send({redirect: '/invoices'});
					else if ("Inventory and Purchasing" == req.session.position)
						res.send({redirect: '/inventory'});
					else if ("Delivery" == req.session.position)
						res.send({redirect: '/deliveries'});*/
					

					res.send({redirect: '/dashboard'});
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
	},

	getDashboard: function (req, res) {
		var employeeName = req.session.name;

		if(req.session.position == null)
			res.redirect('/login')
		
		else if(req.session.position == "Cashier"){
            var cashier = req.session.position;
            res.render('dashboard', {employeeName, cashier});   
        }

    	else if(req.session.position == "Manager"){
            var manager = req.session.position;
            res.render('dashboard', {employeeName, manager});
		}

		else if(req.session.position == "Inventory and Purchasing"){
			var inventoryAndPurchasing = req.session.position;
			res.render('dashboard', {employeeName, inventoryAndPurchasing});	
		}

		else if(req.session.position == "Delivery"){
			var delivery = req.session.position;
			res.render('dashboard', {employeeName, delivery});	
		}
	}
};


module.exports = loginController;