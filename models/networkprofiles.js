// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const AWS = require("../config/database").AWS;
const tablename = "networks";

module.exports.getNetworkByCode = function (code, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "code", code, callback);
};

module.exports.getNetworksImResponsibleFor = function (person, callback) {
    const filter = "contains(#responsiblepeople, :person)";
    DynamoDB.getAllByFilter(AWS, tablename, filter, callback);
};

module.exports.getNetworksByPartialNetworkName = function (partial, callback) {
    const filter = "contains(#name, :name)";
    DynamoDB.getAllByFilter(AWS, tablename, filter, callback);
};

module.exports.getAll = function (callback) {
    DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addNetwork = function (newNetwork, callback) {
    DynamoDB.addItem(AWS, tablename, newNetwork, callback);
};

module.exports.update = function (newData, callback) {
    DynamoDB.updateItem(AWS, tablename, ["code", "name"], newData, callback);
};
