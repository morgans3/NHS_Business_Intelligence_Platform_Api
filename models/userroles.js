// @ts-check

const AWS = require("../config/database").AWS;
const tableName = "userroles";
const docClient = new AWS.DynamoDB.DocumentClient();
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;

// TODO: Change to npm library function
module.exports.getByID = function (username, roleassignedDT, callback) {
  var params = {
    TableName: tableName,
    KeyConditionExpression: "#username = :username AND #roleassignedDT = :roleassignedDT",
    ExpressionAttributeNames: {
      "#roleassignedDT": "roleassignedDT",
      "#username": "username",
    },
    ExpressionAttributeValues: {
      ":roleassignedDT": roleassignedDT,
      ":username": username,
    },
  };
  docClient.query(params, callback);
};

module.exports.getItemsByUsername = function (username, callback) {
  DynamoDB.getItemByIndex(AWS, tableName, "username", username, callback);
};

module.exports.getItemsByUsernameAndOrgID = function (username, organisationid, callback) {
  DynamoDB.getItemByIndex(AWS, tableName, ["username", "organisationid"], { username, organisationid }, callback);
};

module.exports.getAll = function (callback) {
  DynamoDB.getAll(AWS, tableName, callback);
};

module.exports.addItem = function (newItem, callback) {
  DynamoDB.addItem(AWS, tableName, newItem, callback);
};

module.exports.removeItem = function (username, roleassignedDT, callback) {
  DynamoDB.removeItem(AWS, tableName, { username, roleassignedDT }, callback);
};

module.exports.updateItem = function (updatedItem, callback) {
  DynamoDB.updateItem(AWS, tableName, ["username", "roleassignedDT"], updatedItem, callback);
};
