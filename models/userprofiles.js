// @ts-check

const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "userprofiles";

module.exports.getUserProfileById = function (id, callback) {
    DynamoDB.getItemByKey(AWS, tablename, "_id", id, callback);
};

module.exports.getUserProfileByUsername = function (username, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "username", username, callback);
};

module.exports.getAll = function (callback) {
    DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addUserProfile = function (newUserProfile, callback) {
    const assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newUserProfile["_id"] = { S: assignRandomint };
    DynamoDB.addItem(AWS, tablename, newUserProfile, callback);
};

module.exports.remove = function (user, callback) {
    const key = {
        _id: user["_id"],
        username: user.username,
    };
    DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.updateUserProfile = function (newData, callback) {
    DynamoDB.updateItem(AWS, tablename, ["_id", "username"], newData, callback);
};
