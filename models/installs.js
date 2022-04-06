// @ts-check
const AWS = require("../config/database").AWS;
const docClient = new AWS.DynamoDB.DocumentClient();

//Model variables
const tableName = "installs";

module.exports.create = function (item, callback) {
    var docClient = new AWS.DynamoDB();
    var params = {
        TableName: tableName,
        Item: AWS.DynamoDB.Converter.marshall(item),
    };
    docClient.putItem(params, callback);
};