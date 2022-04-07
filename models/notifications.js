// @ts-check

const AWS = require("../config/database").AWS;
var docClient = new AWS.DynamoDB.DocumentClient();

const tablename = "notifications";

module.exports.getAll = function (callback) {
    var params = {
        TableName: tablename,
    };
    docClient.scan(params, callback);
};

module.exports.getNotificationById = function (id, callback) {
    var params = {
        TableName: tablename,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "_id",
        },
        ExpressionAttributeValues: {
            ":id": id,
        },
    };
    docClient.query(params, callback);
};

module.exports.getNotificationsByUsername = function (username, callback) {
    var params = {
        TableName: tablename,
        IndexName: "username-index",
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: {
            "#username": "username",
        },
        ExpressionAttributeValues: {
            ":username": username,
        },
    };
    docClient.query(params, callback);
};

module.exports.getNotificationsByTeamCode = function (teamcode, callback) {
    var params = {
        TableName: tablename,
        IndexName: "teamcode-index",
        KeyConditionExpression: "#teamcode = :teamcode",
        ExpressionAttributeNames: {
            "#teamcode": "teamcode",
        },
        ExpressionAttributeValues: {
            ":teamcode": teamcode,
        },
    };
    docClient.query(params, callback);
};

module.exports.getNotificationsByEmail = function (email, callback) {
    var params = {
        TableName: tablename,
        IndexName: "email-index",
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email",
        },
        ExpressionAttributeValues: {
            ":email": email,
        },
    };
    docClient.query(params, callback);
};

module.exports.addNotification = function (newNotification, callback) {
    var assignRandomint = getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newNotification._id = { S: assignRandomint };
    var docClient = new AWS.DynamoDB();
    var params = {
        TableName: tablename,
        Item: newNotification,
    };
    docClient.putItem(params, (error, result) => {
        return callback(null, assignRandomint);
    });
};

function getDateTime() {
    var now = new Date();
    var year = now.getFullYear().toString();
    var month = (now.getMonth() + 1).toString();
    var day = now.getDate().toString();
    var hour = now.getHours().toString();
    var minute = now.getMinutes().toString();
    var second = now.getSeconds().toString();
    if (month.toString().length == 1) {
        month = "0" + month;
    }
    if (day.toString().length == 1) {
        day = "0" + day;
    }
    if (hour.toString().length == 1) {
        hour = "0" + hour;
    }
    if (minute.toString().length == 1) {
        minute = "0" + minute;
    }
    if (second.toString().length == 1) {
        second = "0" + second;
    }
    var dateTime = year + month + day + hour + minute + second;
    return dateTime;
}

module.exports.update = function (updatedApp, callback) {
    let update = "set #md=:md, #tp=:type, sentdate=:sd, sender=:sr, #head=:hd, importance=:im";
    let expression = {
        ":md": updatedApp.method,
        ":type": updatedApp.type,
        ":sd": updatedApp.sentdate,
        ":sr": updatedApp.sender,
        ":hd": updatedApp.header,
        ":im": updatedApp.importance,
    };
    if (updatedApp["username"]) {
        update = update + ", username=:un";
        expression[":un"] = updatedApp.username;
    }
    if (updatedApp["teamcode"]) {
        update = update + ", teamcode=:tc";
        expression[":tc"] = updatedApp.teamcode;
    }
    if (updatedApp["icon"]) {
        update = update + ", icon=:ic";
        expression[":ic"] = updatedApp.icon;
    }
    if (updatedApp["acknowledgeddate"]) {
        update = update + ", acknowledgeddate=:ad";
        expression[":ad"] = updatedApp.acknowledgeddate;
    }
    if (updatedApp["message"]) {
        update = update + ", message=:msg";
        expression[":msg"] = updatedApp.message;
    }
    if (updatedApp["link"]) {
        update = update + ", link=:lk";
        expression[":lk"] = updatedApp.link;
    }
    if (updatedApp["email"]) {
        update = update + ", email=:em";
        expression[":em"] = updatedApp.email;
    }
    var params = {
        TableName: tablename,
        Key: {
            _id: updatedApp._id,
        },
        UpdateExpression: update,
        ExpressionAttributeValues: expression,
        ExpressionAttributeNames: {
            "#md": "method",
            "#head": "header",
            "#tp": "type",
        },
        ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, callback);
};
