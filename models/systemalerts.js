// @ts-check

const AWS = require("../config/database").AWS;
var docClient = new AWS.DynamoDB.DocumentClient();
const tablename = "systemalerts";

module.exports.getAll = function (callback) {
  var params = {
    TableName: tablename,
  };
  docClient.scan(params, callback);
};

module.exports.getSystemAlertsById = function (id, callback) {
  var params = {
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
  var params = {
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
  var assignRandomint = getDateTime() + Math.floor(Math.random() * 1e4).toString();
  newSystemAlert._id = { S: assignRandomint };
  var docClient = new AWS.DynamoDB();
  var params = {
    TableName: tablename,
    Item: newSystemAlert,
  };
  docClient.putItem(params, (error, result) => {
    return callback(error, assignRandomint);
  });
};

module.exports.updateSystemAlert = function (systemAlert, callback) {
  var params = {
    TableName: tablename,
    Key: {
      _id: systemAlert._id,
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
  var now = new Date();
  var year = now.getFullYear().toString().substring(2);
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
