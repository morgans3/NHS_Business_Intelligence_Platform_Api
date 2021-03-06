const credentials = require("../_credentials/credentials");
const jwt = require("jsonwebtoken");
const DIULibrary = require("diu-data-functions");
const CapabilityModel = new DIULibrary.Models.CapabilityModel();
const Members = require("../models/teammembers");
let token;

module.exports.upgradePassportwithOrganisation = (previousToken, mfa, callback) => {
    const capabilities = [];
    const memberships = previousToken.memberships || [];
    const usernameAndOrganisation = previousToken.username + "#" + previousToken.organisation;
    CapabilityModel.getAllCapabilitiesFromTeamArrayAndUserID(
        memberships.map((item) => item.teamcode),
        usernameAndOrganisation,
        (err, result) => {
            if (err) {
                callback(err, null);
            } else {
                if (result && result.length > 0) {
                    result.forEach((capability) => {
                        const obj = {};
                        obj[capability["name"]] = capability["valuejson"];
                        capabilities.push(obj);
                    });
                }
                const upgrade = {
                    id: previousToken.id,
                    name: previousToken.name,
                    username: previousToken.username,
                    email: previousToken.email,
                    organisation: previousToken.organisation,
                    authentication: previousToken.authentication,
                    memberships,
                    mfa,
                    capabilities,
                };
                token = jwt.sign(upgrade, credentials.secret, {
                    expiresIn: 86400, // 1 day
                });
                callback(null, token);
            }
        }
    );
};

module.exports.authenticateDemo = function (user, callback) {
    const id = user.id || user.username + "_Collaborative Partners";
    getTeamMembershipsByUsername(user.username, (err, memberships) => {
        if (err) {
            console.error(err);
        }
        const returnUser = {
            id,
            name: user.name,
            username: user.username,
            email: user.email,
            organisation: "Collaborative Partners",
            authentication: "demo",
            memberships,
        };
        token = jwt.sign(returnUser, credentials.secret, {
            expiresIn: 604800, // 1 week
        });
        callback(null, token);
    });
};

function getTeamMembershipsByUsername(username, callback) {
    Members.getteamsByMember(username, function (err, result) {
        if (err) {
            callback(err, []);
        } else {
            if (result.Items) {
                callback(null, result.Items);
            } else {
                callback(null, []);
            }
        }
    });
}
