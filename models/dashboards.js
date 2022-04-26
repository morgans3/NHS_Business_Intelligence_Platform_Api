// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const AWS = require("../config/database").AWS;
const tablename = "dashboards";

module.exports.removeDashboard = function (name, env, callback) {
  const key = {
    name: name,
    environment: env,
  };
  DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.getDashboardByName = function (name, callback) {
  DynamoDB.getItemByKey(AWS, tablename, "name", name, callback);
};

module.exports.getDashboardByOwner = function (owner, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "ownerName", owner, callback);
};

module.exports.getDashboardByEnvironment = function (environment, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "environment", environment, callback);
};

module.exports.getDashboardByStatus = function (status, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "status", status, callback);
};

module.exports.getAll = function (callback) {
  DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addDashboard = function (newDashboard, callback) {
  DynamoDB.addItem(AWS, tablename, newDashboard, callback);
};

module.exports.updateDashboard = function (updatedItem, callback) {
  DynamoDB.updateItem(AWS, tablename, ["name", "environment"], updatedItem, callback);
};
