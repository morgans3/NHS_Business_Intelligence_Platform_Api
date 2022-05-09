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
        issuer,
    });

    const url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: username,
        issuer,
        encoding: "base32",
    });

    QRCode.toDataURL(url, (err, dataURL) => {
        if (err) callback(err, { status: 400, msg: err });
        callback(null, {
            message: "TFA Auth needs to be verified",
            tempSecret: secret.base32,
            dataURL,
            tfaURL: secret.otpauth_url,
        });
    });
};

module.exports.verify = function (username, token, tempSecret, decodedToken, callback) {
    const isVerified = speakeasy.totp.verify({
        secret: tempSecret,
        encoding: "base32",
        token,
    });
    if (isVerified) {
        this.addUserSecret(username, tempSecret, decodedToken, callback);
    } else {
        callback(new Error("Invalid"), {
            status: 403,
            message: "Invalid Auth Code, verification failed.",
        });
    }
};

module.exports.validate = function (secret, token) {
    return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
    });
};

module.exports.unregister = function (username, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const getparams = {
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
        if (err) {
            callback(err, { status: 400, msg: err });
        }
        if (result.Items && result.Items.length > 0) {
        }
        const params = {
            TableName: "mfa",
            Key: {
                username,
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
            if (error) callback(error, { status: 400, msg });
            else callback(null, { status: 200, msg });
        });
    });
};

module.exports.getUserSecret = function (username, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
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
    const newValue = {
        username: { S: username },
        verification: { S: secret },
    };
    const docClient = new AWS.DynamoDB();
    const params = {
        TableName: "mfa",
        Item: newValue,
    };
    docClient.putItem(params, (err, result) => {
        if (err) callback(err, { status: 400, msg: err });
        else {
            Authenticate.upgradePassportwithOrganisation(decodedToken, true, (errUpgrade, token) => {
                if (errUpgrade) callback(errUpgrade, { status: 400, msg: errUpgrade });
                callback(null, { status: 200, message: "Authorized", token });
            });
        }
    });
};

module.exports.check = function (username, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
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
