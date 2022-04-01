// @ts-check
const AWS = require("../config/database").AWS;
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;

//Model variables
const tableName = "form_submissions";

module.exports.create = function (item, callback) {
  const newItem = AWS.DynamoDB.Converter.marshall(item);
  DynamoDB.addItem(AWS, tableName, newItem, callback);
};

// TODO: Change to npm library function
module.exports.update = function (id, item, callback) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: tableName,
    Key: { id: id },
    UpdateExpression: "set #data.approved = :approved",
    ExpressionAttributeNames: {
      "#data": "data",
    },
    ExpressionAttributeValues: {
      ":approved": item.approved,
    },
    ReturnValues: "ALL_NEW",
  };
  // @ts-ignore
  docClient.update(params, (error, data) => {
    callback(error, data.Attributes || null);
  });
};

// TODO: Change Scan to Query
module.exports.get = function (params, callback) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var query = {
    TableName: tableName,
  };

  //Get by page
  if (params.pageKey) {
    query.ExclusiveStartKey = {
      id: params.pageKey,
    };
  }

  //Filter by type
  if (params.type) {
    query.FilterExpression = "#type = :type";
    query.ExpressionAttributeNames = {
      "#type": "type",
    };
    query.ExpressionAttributeValues = {
      ":type": params.type,
    };
  }

  //Run query
  docClient.scan(query, callback);
};

module.exports.getById = function (id, callback) {
  DynamoDB.getItemByKey(AWS, tableName, "id", id, callback);
};
