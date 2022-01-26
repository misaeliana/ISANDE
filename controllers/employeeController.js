// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Employees = require('../models/EmployeeModel.js');

const EmployeePositions = require('../models/EmployeePositionsModel.js');

const bcrypt = require('bcrypt');

require('../controllers/helpers.js');

const employeeController = {
	getEmployeeList: function(req, res) {
		//if(req.session.position != "Manager"){
				//res.redirect('/dashboard');
		//}
		//else{
			async function getInformation() {
				var employees_temp = await getEmployees();
				var employees = [];
				for (var i=0; i<employees_temp.length; i++) {
					var positionName = await getPositionName(employees_temp[i].positionID);
					var employee = {
						employeeID: employees_temp[i]._id,
						name: employees_temp[i].name,
						position: positionName, 
						number:employees_temp[i].number
					};
					employees.push(employee);
				}

				employees.sort(function(a, b) {
					var textA = a.name.toUpperCase();
					var textB = b.name.toUpperCase();
					//syntax is "condition ? value if true : value if false"
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});

				var positions = await getAllPositions();
				res.render('employeeList', {positions, employees});
			}
			getInformation();
		// }
	},

	postEmployeeInformation: function(req, res) {
		var saltRounds = 10;

		bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		
			var employee = {
				name: req.body.name,
				username:req.body.username,
				password: hash,
				number: req.body.number,
				positionID: req.body.position,
				informationStatusID: "618a7830c8067bf46fbfd4e4"
			};

			db.insertOne(Employees, employee, function (flag) {
				if (flag)
					res.sendStatus(200);
			});
		});

	},

	checkEmployeeName: function(req, res) {
		var name = req.query.name;

		db.findMany(Employees, {name:name, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {	
			res.send(result[0]);
		});

	},

	checkEmployeeUsername: function(req, res) {
		var username = req.query.username;

		db.findMany(Employees, {username:username, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'username', function(result) {	
			res.send(result[0]);
		});

	},

	getViewEmployee: function(req, res) {
		//if(req.session.position != "Manager"){
			//res.redirect('/dashboard');
		//}
		//else{
			async function getInformation() {
				var employeeInfo = await getEmployeeInfo(req.params.employeeID);
				var positions = await getAllPositions();

				employeeInfo.positionName = await getPositionName(employeeInfo.positionID);
				res.render('employeeInformation', {employeeInfo, positions});
			}

			getInformation();
		//}
	},

	postUpdateInformation: function(req, res) {
		var employeeID = req.body.employeeID;

		db.updateOne(Employees, {_id:employeeID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag) {
			if (flag) { }
		});

		var employee = {
			//name:req.body.name, 
			username:req.body.username, 
			password:req.body.password, 
			number:req.body.number, 
			positionID:req.body.position,
			informationStatusID:"618a7830c8067bf46fbfd4e4"
		};

		db.insertOneResult(Employees, employee, function(result) {
			res.send(result._id);
		});
	},

	deleteEmployee: function(req, res) {
		var employeeID = req.body.employeeID;

		db.updateOne(Employees, {_id: employeeID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		});
	}
};

module.exports = employeeController;