// @ts-check

const AWS = require("../config/database").AWS;
const docClient = new AWS.DynamoDB.DocumentClient();

const tablename = "otp_codes";

module.exports.generateCode = function (email, token, callback) {
    const client = new AWS.DynamoDB();
    const date = new Date().toISOString();
    let genCode = "";
    for (let index = 0; index < 9; index++) {
        genCode = genCode + randomNumString();
    }
    const params = {
        TableName: tablename,
        Item: { email: { S: email }, code: { S: genCode }, createdDT: { S: date }, token: { S: token } },
    };
    client.putItem(params, (err, res) => {
        if (err) callback(err, null);
        else callback(null, genCode);
    });
};

function randomNumString() {
    return Math.floor(Math.random() * 10)
        .toString()
        .substr(0, 1);
}

module.exports.validateCode = function (email, code, token, callback) {
    const params = {
        TableName: tablename,
        KeyConditionExpression: "#email = :email AND #code = :code",
        ExpressionAttributeNames: {
            "#email": "email",
            "#code": "code",
        },
        ExpressionAttributeValues: {
            ":email": email,
            ":code": code,
        },
    };
    docClient.query(params, (err, res) => {
        if (err) callback(err, null);
        else {
            if (res.Count === 0) callback(null, false);
            else {
                if (res.Items[0].token === token) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        }
    });
};
