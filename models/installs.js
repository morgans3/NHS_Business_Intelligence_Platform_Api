// @ts-check
const AWS = require("../config/database").AWS;

// Model variables
const tableName = "installs";

module.exports.create = function (item, callback) {
    const docClient = new AWS.DynamoDB();
    const params = {
        TableName: tableName,
        Item: AWS.DynamoDB.Converter.marshall(item),
    };
    docClient.putItem(params, callback);
};
