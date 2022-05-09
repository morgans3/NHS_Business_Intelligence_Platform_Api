// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "networkmembers";

module.exports.remove = function (item, callback) {
    const key = {
        _id: item["_id"],
        networkcode: item.networkcode,
    };
    DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.getNetworkMemberById = function (id, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "_id", id, callback);
};

module.exports.getNetworkMembersByNetwork = function (code, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "networkcode", code, callback);
};

module.exports.getNetworksByMember = function (teamcode, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "teamcode", teamcode, callback);
};

module.exports.getAll = function (callback) {
    DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addNetworkMember = function (newnetworkMember, callback) {
    const assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newnetworkMember["_id"] = { S: assignRandomint };
    DynamoDB.addItem(AWS, tablename, newnetworkMember, callback);
};

module.exports.update = function (newData, callback) {
    DynamoDB.updateItem(AWS, tablename, ["_id", "networkcode"], newData, callback);
};
