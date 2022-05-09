// @ts-check

const AWS = require("../config/database").AWS;

module.exports.getByPage = function (page, limit, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: "opensourceviews",
        IndexName: "page-index",
        KeyConditionExpression: "#page = :page",
        ExpressionAttributeNames: {
            "#page": "page",
        },
        ExpressionAttributeValues: {
            ":page": page,
        },
        Limit: limit,
    };
    docClient.query(params, callback);
};

module.exports.addView = function (newView, callback) {
    (new AWS.DynamoDB()).putItem(
        {
            TableName: "opensourceviews",
            Item: AWS.DynamoDB.Converter.marshall(newView),
        },
        (err, data) => {
            callback(err, newView, data);
        }
    );
};
