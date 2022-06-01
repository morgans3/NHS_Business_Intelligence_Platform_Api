// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const AWS = require("../config/database").AWS;
const DIULibrary = require("diu-data-functions");
const CapabilityModel = new DIULibrary.Models.CapabilityModel();
const tablename = "apps";

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

module.exports.addApp = function (app, callback) {
    // Create capability
    CapabilityModel.create({
        name: app.name,
        description: `Access to the ${app.name} app`,
        value: JSON.stringify({ type: "allow_deny" }),
        tags: ["App"]
    }, (error, newCapabilities) => {
        // Handle error
        if (error) { callback(error, null); }

        // Set capability
        app.capability = newCapabilities[0].id;

        // Persist app
        (new AWS.DynamoDB()).putItem(
            {
                TableName: tablename,
                Item: AWS.DynamoDB.Converter.marshall(app),
            },
            (err, newApp) => { callback(err, app, newApp); }
        );
    });
};

module.exports.removeApp = function (name, env, callback) {
    // Remove app
    DynamoDB.removeItem(AWS, tablename, {
        name,
        environment: env,
    }, (error, data) => {
        // Handle error
        if (error) { callback(error, null); }

        // Delete capability
        if (data.msg.Attributes.capability) {
            CapabilityModel.deleteByPrimaryKey(data.msg.Attributes.capability, callback);
        } else {
            callback(null, data);
        }
    });
};

module.exports.updateApp = function (updatedItem, callback) {
    DynamoDB.updateItem(AWS, tablename, ["name", "environment"], updatedItem, (err, data) => {
        callback(err, updatedItem, data);
    });
};
