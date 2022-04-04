// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "teams";

module.exports.getTeamById = function (id, callback) {
  DynamoDB.getItemByKey(AWS, tablename, "_id", id, callback);
};

module.exports.getTeamByCode = function (code, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "code", code, callback);
};

module.exports.getTeamsImResponsibleFor = function (person, callback) {
  const filter = "contains(#responsiblepeople, :person)";
  DynamoDB.getAllByFilterValue(AWS, tablename, filter, "responsiblepeople", person, callback);
};

module.exports.getTeamsByOrg = function (org, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "organisationcode", org, callback);
};

module.exports.getTeamsByPartialTeamNameAndOrgCode = function (partial, orgcode, callback) {
  const filter = "contains(#name, :name) and #organisationcode = :organisationcode";
  DynamoDB.getAllByFilterValues(AWS, tablename, filter, ["name", "organisationcode"], [partial, orgcode], callback);
};

module.exports.getTeamsByPartialTeamName = function (partial, callback) {
  const filter = "contains(#name, :name)";
  DynamoDB.getAllByFilterValue(AWS, tablename, filter, "name", partial, callback);
};

module.exports.getAll = function (callback) {
  DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addTeam = function (newTeam, callback) {
  var assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
  newTeam._id = { S: assignRandomint };
  DynamoDB.addItem(AWS, tablename, newTeam, callback);
};

module.exports.remove = function (team, callback) {
  const key = {
    _id: team._id,
    code: team.code,
  };
  DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.update = function (newData, callback) {
  DynamoDB.updateItem(AWS, tablename, ["_id", "code"], newData, callback);
};
