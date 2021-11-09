// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Employees = require('../models/EmployeeModel.js');

const EmployeePositions = require('../models/EmployeePositionsModel.js');

const employeeController = {

	getEmployeeList: function(req, res) {

		function getAllPositions() {
			return new Promise((resolve, reject) => {
				db.findMany(EmployeePositions, {}, '_id position', function (result) {
					resolve (result)
				})
			})
		}

		function getPositionName(positionID) {
			return new Promise((resolve, reject) => {
				db.findOne (EmployeePositions, {_id:positionID}, 'position', function(result) {
					resolve(result.position)
				})
			})
		}


		function getEmployees() {
			return new Promise((resolve, reject) => {
				db.findMany(Employees, {informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name positionID number', function(result) {
					resolve (result)
				})
			})
		}

		async function getInformation() {
			var employees_temp = await getEmployees();
			var employees = []
			for (var i=0; i<employees_temp.length; i++) {
				var positionName = await getPositionName(employees_temp[i].positionID)
				var employee = {
					employeeID: employees_temp[i]._id,
					name: employees_temp[i].name,
					position: positionName, 
					number:employees_temp[i].number
				}
				employees.push(employee);
			}

			var positions = await getAllPositions();

			res.render('employeeList', {positions, employees})
		}

		getInformation();

	},

	postEmployeeInformation: function(req, res) {
		var employee = {
			name: req.body.name,
			username:req.body.username,
			password: req.body.password,
			number: req.body.number,
			positionID: req.body.position,
			employeeStatusID: "Active",
			informationStatusID: "Active"
		}

		db.insertOne(Employees, employee, function (flag) {
			if (flag) { }
		})

	},

	checkEmployeeName: function(req, res) {
		var name = req.query.name;

		db.findMany(Employees, {name:name, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'name', function(result) {	
			res.send(result[0]);
		})

	},

	checkEmployeeUsername: function(req, res) {
		var username = req.query.username;

		db.findMany(Employees, {username:username, informationStatusID:"618a7830c8067bf46fbfd4e4"}, 'username', function(result) {	
			res.send(result[0]);
		})

	},

	getViewEmployee: function(req, res) {
		function getAllPositions() {
			return new Promise((resolve, reject) => {
				db.findMany(EmployeePositions, {}, '_id position', function (result) {
					resolve (result)
				})
			})
		}

		function getEmployeeInfo(employeeID) {
			return new Promise((resolve, reject) => {
				db.findOne(Employees, {_id: req.params.employeeID}, '_id name username number position', function(result) {
					resolve (result)
				})
			})
		}

		async function getInformation() {
			var employeeInfo = await getEmployeeInfo()
			var positions = await getAllPositions()
			res.render('employeeInformation', {employeeInfo, positions})
		}

		getInformation();
		
	},

	postUpdateInformation: function(req, res) {
		var employeeID = req.body.employeeID;

		db.updateOne(Employees, {_id:employeeID}, {$set: {name:req.body.name, username:req.body.username, password:req.body.password, number:req.body.number, position:req.body.position}}, function(flag) {
			if (flag) { }
		})
	},

	deleteEmployee: function(req, res) {
		var employeeID = req.body.employeeID;

		db.updateOne(Employees, {_id: employeeID}, {$set: {informationStatusID:"618a783cc8067bf46fbfd4e5"}}, function(flag){
			if (flag) { }
		})
	}
}

module.exports = employeeController;