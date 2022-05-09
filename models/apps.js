// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const AWS = require("../config/database").AWS;
const tablename = "apps";

module.exports.removeApp = function (name, env, callback) {
    const key = {
        name,
        environment: env,
    };
    DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.getAppByName = function (name, callback) {
    DynamoDB.getItemByKey(AWS, tablename, "name", name, callback);
};

module.exports.getAppByOwner = function (owner, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "ownerName", owner, callback);
};

module.exports.getAppByEnvironment = function (environment, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "environment", environment, callback);
};

module.exports.getAppByStatus = function (status, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "status", status, callback);
};

module.exports.getAll = function (callback) {
    DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addApp = function (newApp, callback) {
    (new AWS.DynamoDB()).putItem(
        {
            TableName: tablename,
            Item: AWS.DynamoDB.Converter.marshall(newApp),
        },
        (err, data) => { callback(err, newApp, data); }
    );
};

module.exports.updateApp = function (updatedItem, callback) {
    DynamoDB.updateItem(AWS, tablename, ["name", "environment"], updatedItem, (err, data) => {
        callback(err, updatedItem, data);
    });
};
