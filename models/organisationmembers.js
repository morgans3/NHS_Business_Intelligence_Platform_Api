// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "orgmembers";

module.exports.getOrgMemberById = function (id, callback) {
  DynamoDB.getItemByKey(AWS, tablename, "_id", id, callback);
};

module.exports.getOrgMembersByOrg = function (code, callback) {
  DynamoDB.getItemByKey(AWS, tablename, "organisationcode", code, callback);
};

module.exports.getOrgMembershipsByUsername = function (username, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "username", username, callback);
};

module.exports.getOrgMembersByRole = function (org, role, callback) {
  DynamoDB.getItemByDualIndex(AWS, tablename, ["organisationcode", "rolecode"], [org, role], callback);
};

module.exports.getAll = function (callback) {
  DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addOrgMember = function (newMember, callback) {
  var assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
  newMember._id = { S: assignRandomint };
  DynamoDB.addItem(AWS, tablename, newMember, callback);
};

module.exports.update = function (newData, callback) {
  DynamoDB.updateItem(AWS, tablename, ["_id", "organisationcode"], newData, callback);
};
