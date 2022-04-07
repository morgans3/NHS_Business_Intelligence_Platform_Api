// @ts-check
const AWS = require("../config/database").AWS;
const docClient = new AWS.DynamoDB.DocumentClient();
const access = process.env.AWSPROFILE || "Dev";
const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;
const async = require("async");
const uuid = require("uuid");

const listTableName = "acks_Lists"; // uid, listname, config (arrUsers[]: { username: string, sid: string, org: string, email: string })
const listFilters = ["uid", "listname"];
const documentTableName = "acks_Documents"; // uid, s3filename, uploadDT, author, area
const acksTableName = "acks_Acknowledgements"; // uid, documentuid, username, organisation, email, ackdate, sentdate,

module.exports.getAllAcknowledgements = function (callback) {
    var params = {
        TableName: acksTableName,
    };
    docClient.scan(params, callback);
};

module.exports.createDoc = function (item, callback) {
    var docClient = new AWS.DynamoDB();
    var params = {
        TableName: documentTableName,
        Item: item,
    };
    docClient.putItem(params, callback);
};

module.exports.listAcknowledgementsForDoc = function (documentuid, callback) {
    var params = {
        TableName: acksTableName,
        IndexName: "documentuid-index",
        KeyConditionExpression: "#documentuid = :documentuid",
        ExpressionAttributeNames: {
            "#documentuid": "documentuid",
        },
        ExpressionAttributeValues: {
            ":documentuid": documentuid,
        },
    };
    docClient.query(params, callback);
};

module.exports.listDocs = function (callback) {
    var params = {
        TableName: documentTableName,
    };
    docClient.scan(params, callback);
};

module.exports.mailListOfAcknowledgementsForDoc = (arrList, document, documentinfo, callback) => {
    async.mapSeries(
        arrList,
        (person, innerCB) => {
            const uid = uuid.v1();
            const ack = {
                uid: { S: uid },
                documentuid: { S: documentinfo.uid },
                username: { S: person.username },
                organisation: { S: person.org },
                email: { S: person.email },
                sentdate: { S: new Date().toISOString() },
            };
            this.createAcknowledgementForDoc(ack, (registererr, registerresult) => {
                if (registererr) console.error("ERROR: " + JSON.stringify(ack) + " --- ", registererr);
                else {
                    const message = "Please find attached a new document for you to review. Once you are finished reviewing the document, please click the button below to digitally sign the register so that your colleagues know that you have seen this document. Thank you.";
                    EmailHelper.sendMail({
                        subject: "New document to review",
                        message: message,
                        to: person.email,
                        text: message,
                        attachments: [document],
                        actions: [{
                            class: "primary",
                            text: "Sign Acknowledgement Sheet",
                            type: "sign_acknowledgement",
                            type_params: { uuid: uid, docid: documentinfo.uid }
                        }]
                    }, (err, response) => {
                        if (err) console.error("ERROR: " + JSON.stringify(ack) + " --- ", err);
                        console.log("Message sent: New document to review, to: " + person.email);
                        innerCB(null, "Message sent");
                    });
                }
            });
        },
        (err, result) => {
            callback(null, result);
        }
    );
};

module.exports.createAcknowledgementForDoc = function (item, callback) {
    var docClient = new AWS.DynamoDB();
    var params = {
        TableName: acksTableName,
        Item: item,
    };
    docClient.putItem(params, callback);
};

module.exports.confirmAcknowledgementForDoc = function (uid, documentuid, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const ackdate = new Date().toISOString();
    var params = {
        TableName: acksTableName,
        Key: {
            uid: uid,
            documentuid: documentuid,
        },
        UpdateExpression: "set #ackdate=:ackdate",
        ExpressionAttributeNames: {
            "#ackdate": "ackdate",
        },
        ExpressionAttributeValues: {
            ":ackdate": ackdate,
        },
        ReturnValues: "UPDATED_NEW",
    };
    // @ts-ignore
    docClient.update(params, callback);
};

module.exports.createList = function (item, callback) {
    var docClient = new AWS.DynamoDB();
    var params = {
        TableName: listTableName,
        Item: item,
    };
    docClient.putItem(params, callback);
};
module.exports.removeList = function (uid, listname, callback) {
    var params = {
        TableName: listTableName,
        Key: {
            uid: uid,
            listname: listname,
        },
    };
    docClient.delete(params, callback);
};
module.exports.updateList = function (updatedItem, callback) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    let fields = Object.keys(updatedItem);
    fields = fields.filter((x) => !listFilters.includes(x));
    const update = "set " + updatefields(fields);
    const expressionvals = updateexpression(fields, updatedItem);
    const expressionnames = updateexpressionnames(fields);
    const keys = setkeys(listFilters, updatedItem);
    var params = {
        TableName: listTableName,
        Key: keys,
        UpdateExpression: update,
        ExpressionAttributeValues: expressionvals,
        ExpressionAttributeNames: expressionnames,
        ReturnValues: "UPDATED_NEW",
    };
    // @ts-ignore
    docClient.update(params, callback);
};
module.exports.getList = function (uid, callback) {
    var params = {
        TableName: listTableName,
        KeyConditionExpression: "#uid = :uid",
        ExpressionAttributeNames: {
            "#uid": "uid",
        },
        ExpressionAttributeValues: {
            ":uid": uid,
        },
    };
    docClient.query(params, callback);
};
module.exports.getAllLists = function (callback) {
    var params = {
        TableName: listTableName,
    };
    docClient.scan(params, callback);
};

function updatefields(fields) {
    let output = "";
    fields.forEach((val) => {
        output += "#" + val + "=:" + val + ",";
    });
    return output.substring(0, output.length - 1);
}

function updateexpression(fields, updateItem) {
    let exp = {};
    fields.forEach((val) => {
        exp[":" + val] = updateItem[val];
    });
    return exp;
}

function updateexpressionnames(fields) {
    let exp = {};
    fields.forEach((val) => {
        exp["#" + val] = val;
    });
    return exp;
}
function setkeys(fields, item) {
    let exp = {};
    fields.forEach((val) => {
        exp[val] = item[val];
    });
    return exp;
}
