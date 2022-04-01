// @ts-check
const AWS = require("../config/database").AWS;
const tableName = "verificationcodes";
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;

module.exports.getCode = function (code, callback) {
  DynamoDB.getItemByKey(AWS, tableName, "code", code, callback);
};

module.exports.deleteCode = function (code, username, callback) {
  const key = {
    code: code,
    username: username,
  };
  DynamoDB.removeItem(AWS, tableName, key, callback);
};
