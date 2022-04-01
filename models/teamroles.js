// @ts-check

const AWS = require("../config/database").AWS;
const tablename = "teamroles";
const docClient = new AWS.DynamoDB.DocumentClient();
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;

// TODO: Change to npm library function
module.exports.getByID = function (teamcode, roleassignedDT, callback) {
  var params = {
    TableName: tablename,
    KeyConditionExpression: "#teamcode = :teamcode AND #roleassignedDT = :roleassignedDT",
    ExpressionAttributeNames: {
      "#roleassignedDT": "roleassignedDT",
      "#teamcode": "teamcode",
    },
    ExpressionAttributeValues: {
      ":roleassignedDT": roleassignedDT,
      ":teamcode": teamcode,
    },
  };
  docClient.query(params, callback);
};

module.exports.getItemsByTeamcode = function (teamcode, callback) {
  DynamoDB.getItemByIndex(AWS, tablename, "teamcode", teamcode, callback);
};

module.exports.getItemsByTeamcodes = function (teams, callback) {
  const expressionAttributeValues = {};
  const userIdParams = teams
    .map((u, i) => {
      const userParam = `:team${i}`;
      expressionAttributeValues[userParam] = u;
      return userParam;
    })
    .join(",");
  var params = {
    TableName: tablename,
    FilterExpression: "#teamcode IN (" + userIdParams + ")",
    ExpressionAttributeNames: {
      "#teamcode": "teamcode",
    },
    ExpressionAttributeValues: expressionAttributeValues,
  };
  docClient.scan(params, callback);
};

module.exports.getAll = function (callback) {
  DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addItem = function (newItem, callback) {
  DynamoDB.addItem(AWS, tablename, newItem, callback);
};

module.exports.removeItem = function (teamcode, roleassignedDT, callback) {
  DynamoDB.removeItem(AWS, tablename, { teamcode, roleassignedDT }, callback);
};

module.exports.updateItem = function (updatedItem, callback) {
  DynamoDB.updateItem(AWS, tablename, ["teamcode", "roleassignedDT"], updatedItem, callback);
};
