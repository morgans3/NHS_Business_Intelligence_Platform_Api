// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "teammembers";

module.exports.remove = function (id, code, callback) {
    const key = {
        id,
        teamcode: code,
    };
    DynamoDB.removeItem(AWS, tablename, key, callback);
};

module.exports.getteamMemberById = function (id, callback) {
    DynamoDB.getItemByKey(AWS, tablename, "id", id, callback);
};

module.exports.getteamMembersByteam = function (code, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "teamcode", code, callback);
};

module.exports.getteamsByMember = function (username, callback) {
    DynamoDB.getItemByIndex(AWS, tablename, "username", username, callback);
};

module.exports.getteamMembersByRole = function (team, role, callback) {
    DynamoDB.getItemByDualIndex(AWS, tablename, ["teamcode", "rolecode"], [team, role], callback);
};

module.exports.getAll = function (callback) {
    DynamoDB.getAll(AWS, tablename, callback);
};

module.exports.addteamMember = function (newMember, callback) {
    const assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newMember.id = { S: assignRandomint };
    DynamoDB.addItem(AWS, tablename, newMember, (err, res) => {
        callback(err, newMember);
    });
};

module.exports.update = function (newData, callback) {
    DynamoDB.updateItem(AWS, tablename, ["id", "teamcode"], newData, callback);
};
