// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "teamrequests";

module.exports.remove = function (id, code, callback) {
    const key = {
        id,
        teamcode: code,
    };
    DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.getRequestById = function (id, callback) {
    DynamoDB.getItemByKey(AWS, tablename, "id", id, callback);
};

module.exports.getRequestsByUsername = function (name, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "username", name, callback);
};

module.exports.getRequestsByTeamCode = function (code, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "teamcode", code, callback);
};

module.exports.getRequestsByTeamCodeAndUser = function (code, callback) {
    DynamoDB.getAllByFilterValues(
        AWS,
        tablename,
        "#teamcode = :teamcode AND #username = :username",
        ["teamcode", "username"],
        code,
        callback
    );
};

module.exports.getAll = function (callback) {
    DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addRequest = function (newRequest, callback) {
    const assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newRequest.id = { S: assignRandomint };
    DynamoDB.addItem(AWS, tablename, newRequest, callback);
};

module.exports.update = function (newData, callback) {
    DynamoDB.updateItem(AWS, tablename, ["id", "teamcode"], newData, callback);
};
