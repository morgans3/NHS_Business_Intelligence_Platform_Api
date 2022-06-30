// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const Generic = require("diu-data-functions").Methods.Generic;
const AWS = require("../config/database").AWS;
const tablename = "teamrequests";
const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;
const TeamModel = new DIULibrary.Models.TeamModel();

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

module.exports.addRequest = function (newRequest, emailto, name, callback) {
    const assignRandomint = Generic.getDateTime() + Math.floor(Math.random() * 1e4).toString();
    newRequest.id = { S: assignRandomint };
    DynamoDB.addItem(AWS, tablename, newRequest, (err, result) => {
        if (err) callback(err, null);
        else {
            const data = {
                request: result,
                name,
                emailto,
            };
            sendEmail(data, callback);
        }
    });
};

module.exports.update = function (newData, callback) {
    DynamoDB.updateItem(AWS, tablename, ["id", "teamcode"], newData, callback);
};

const getTeamInfo = function (teamcode, callback) {
    TeamModel.getByCode(teamcode, function (err, result) {
        if (err) {
            callback(null, {
                name: "Unknown Team Name",
                code: teamcode,
            });
        } else {
            if (result.Items.length > 0) {
                callback(null, result.Items[0]);
            } else {
                callback(null, {
                    name: "Unknown Team Name",
                    code: teamcode,
                });
            }
        }
    });
};

const sendEmail = async function (data, callback) {
    let message = `<p>The team administrator has asked if you could join their Team on our NHS BI Platform.
    This will give you the same access permissions as other members of the team.</p>`;
    const emailTo = data.emailto;

    getTeamInfo(data.request.teamcode, (errTeam, infoTeam) => {
        if (errTeam) {
            callback(errTeam, null);
        } else {
            if (data.request.requestor) {
                message = `<p>${data.name} has requested access to the Team.</p>`;
            }
            EmailHelper.sendMail(
                {
                    to: emailTo,
                    subject: "NHS BI Platform - Team Request - " + infoTeam.name,
                    message,
                    actions: [
                        {
                            class: "primary",
                            text: "Accept Request",
                            type: "team_request_action",
                            type_params: {
                                id: data.request.id,
                                teamcode: data.request.teamcode,
                                action: "accept",
                            },
                        },
                        {
                            class: "warn",
                            text: "Reject Request",
                            type: "team_request_action",
                            type_params: {
                                id: data.request.id,
                                teamcode: data.request.teamcode,
                                action: "reject",
                            },
                        },
                    ],
                },
                (emailErr, emailResult) => {
                    if (emailErr) {
                        callback(emailErr, null);
                    } else {
                        callback(null, data.request);
                    }
                }
            );
        }
    });
};

module.exports.sendNotification = sendEmail;
