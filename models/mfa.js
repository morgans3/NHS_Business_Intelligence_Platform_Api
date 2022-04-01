// @ts-check

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const AWS = require("../config/database").AWS;
const Authenticate = require("../models/authenticate");
const issuer = process.env.SITE_URL || "NHS_BI_Platform";

module.exports.setup = function (username, callback) {
  const secret = speakeasy.generateSecret({
    length: 10,
    name: username,
    issuer: issuer,
  });

  var url = speakeasy.otpauthURL({
    secret: secret.base32,
    label: username,
    issuer: issuer,
    encoding: "base32",
  });

  QRCode.toDataURL(url, (err, dataURL) => {
    callback(null, {
      message: "TFA Auth needs to be verified",
      tempSecret: secret.base32,
      dataURL,
      tfaURL: secret.otpauth_url,
    });
  });
};

module.exports.verify = function (username, token, tempSecret, decodedToken, callback) {
  let isVerified = speakeasy.totp.verify({
    secret: tempSecret,
    encoding: "base32",
    token: token,
  });
  if (isVerified) {
    this.addUserSecret(username, tempSecret, decodedToken, callback);
  } else {
    callback(true, {
      status: 403,
      message: "Invalid Auth Code, verification failed.",
    });
  }
};

module.exports.validate = function (secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
  });
};

module.exports.unregister = function (username, callback) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var getparams = {
    TableName: "mfa",
    KeyConditionExpression: "#username = :username",
    ProjectionExpression: "#username, #verification",
    ExpressionAttributeNames: {
      "#username": "username",
      "#verification": "verification",
    },
    ExpressionAttributeValues: {
      ":username": username,
    },
  };
  docClient.query(getparams, (err, result) => {
    if (result.Items && result.Items.length > 0) {
    }
    var params = {
      TableName: "mfa",
      Key: {
        username: username,
        verification: result.Items[0].verification,
      },
      ConditionExpression: "#username = :val",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":val": username,
      },
    };
    docClient.delete(params, (error, msg) => {
      if (error) callback(true, { status: 400, msg: msg });
      else callback(null, { status: 200, msg: msg });
    });
  });
};

module.exports.getUserSecret = function (username, callback) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: "mfa",
    KeyConditionExpression: "#username = :username",
    ProjectionExpression: "#username, #verification",
    ExpressionAttributeNames: {
      "#username": "username",
      "#verification": "verification",
    },
    ExpressionAttributeValues: {
      ":username": username,
    },
  };
  docClient.query(params, callback);
};

module.exports.addUserSecret = function (username, secret, decodedToken, callback) {
  let newValue = {
    username: { S: username },
    verification: { S: secret },
  };
  var docClient = new AWS.DynamoDB();
  var params = {
    TableName: "mfa",
    Item: newValue,
  };
  docClient.putItem(params, (err, result) => {
    if (err) callback(true, { status: 400, msg: err });
    else {
      Authenticate.upgradePassportwithOrganisation(decodedToken, true, (err, token) => {
        if (err) callback(true, { status: 400, msg: err });
        callback(null, { status: 200, message: "Authorized", token: token });
      });
    }
  });
};

module.exports.check = function (username, callback) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: "mfa",
    KeyConditionExpression: "#username = :username",
    ProjectionExpression: "#username, #verification",
    ExpressionAttributeNames: {
      "#username": "username",
      "#verification": "verification",
    },
    ExpressionAttributeValues: {
      ":username": username,
    },
  };
  docClient.query(params, callback);
};
