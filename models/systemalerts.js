// @ts-check

const AWS = require("../config/database").AWS;
const docClient = new AWS.DynamoDB.DocumentClient();
const tablename = "systemalerts";

module.exports.getAll = function (callback) {
    const params = {
        TableName: tablename,
    };
    docClient.scan(params, callback);
};

module.exports.getSystemAlertsById = function (id, callback) {
    const params = {
        TableName: tablename,
        KeyConditionExpression: "#_id = :_id",
        ExpressionAttributeNames: {
            "#_id": "_id",
        },
        ExpressionAttributeValues: {
            ":_id": id,
        },
    };
    docClient.query(params, callback);
};

module.exports.getActiveSystemAlerts = function (date, callback) {
    const params = {
        TableName: tablename,
        FilterExpression: ":DateTime BETWEEN startdate AND enddate AND #arc = :archive",
        ExpressionAttributeValues: {
            ":DateTime": new Date().toISOString(),
            ":archive": false,
        },
        ExpressionAttributeNames: {
            "#arc": "archive",
        },
    };
    docClient.scan(params, callback);
};

module.exports.addSystemAlert = function (newSystemAlert, callback) {
    const assignRandomint = getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newSystemAlert["_id"] = { S: assignRandomint };
    const dynamoDB = new AWS.DynamoDB();
    const params = {
        TableName: tablename,
        Item: newSystemAlert,
    };
    dynamoDB.putItem(params, (error, result) => {
        return callback(error, assignRandomint);
    });
};

module.exports.updateSystemAlert = function (systemAlert, callback) {
    const params = {
        TableName: tablename,
        Key: {
            _id: systemAlert["_id"],
            author: systemAlert.author,
        },
        UpdateExpression: "set #name=:nm, startdate=:sd, enddate=:ed, #msg=:msg, #status=:st, #icon=:ic, #arc=:arc",
        ExpressionAttributeValues: {
            ":nm": systemAlert.name,
            ":sd": systemAlert.startdate,
            ":ed": systemAlert.enddate,
            ":msg": systemAlert.message,
            ":st": systemAlert.status,
            ":ic": systemAlert.icon,
            ":arc": systemAlert.archive,
        },
        ExpressionAttributeNames: {
            "#arc": "archive",
            "#name": "name",
            "#msg": "message",
            "#status": "status",
            "#icon": "icon",
        },
        ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, callback);
};

function getDateTime() {
    const now = new Date();
    const year = now.getFullYear().toString().substring(2);
    let month = (now.getMonth() + 1).toString();
    let day = now.getDate().toString();
    let hour = now.getHours().toString();
    let minute = now.getMinutes().toString();
    let second = now.getSeconds().toString();
    if (month.toString().length === 1) {
        month = "0" + month;
    }
    if (day.toString().length === 1) {
        day = "0" + day;
    }
    if (hour.toString().length === 1) {
        hour = "0" + hour;
    }
    if (minute.toString().length === 1) {
        minute = "0" + minute;
    }
    if (second.toString().length === 1) {
        second = "0" + second;
    }
    const dateTime = year + month + day + hour + minute + second;
    return dateTime;
}
