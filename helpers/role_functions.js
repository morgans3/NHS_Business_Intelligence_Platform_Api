module.exports.checkRole = function (alone, userroles, table) {
    let whereclause = "";

    if (userroles.length > 0) {
        userroles.forEach((role) => {
            const item = JSON.stringify(role);
            const keys = Object.keys(role);
            if (item.includes(table + "_")) {
                if (keys.length > 1) {
                    let current = null;
                    whereclause += "(";
                    keys.forEach((k) => {
                        if (k.includes(table + "_")) {
                            current = k.replace(table + "_", "");
                            whereclause += k.replace(table + "_", "") + " like '" + role[k] + "' AND ";
                        } else {
                            whereclause += current + " like '" + role[k] + "' AND ";
                        }
                    });
                    whereclause = whereclause.substr(0, whereclause.length - 4);
                    whereclause += ") OR ";
                } else {
                    whereclause += keys[0].replace(table + "_", "") + " like '" + role[keys[0]] + "'";
                    whereclause += " OR ";
                }
            }
        });
        if (whereclause.length > 0) {
            whereclause = whereclause.substr(0, whereclause.length - 4);
        }
    }

    if (whereclause.length > 0) {
        if (alone) {
            whereclause = " WHERE " + whereclause;
        } else {
            whereclause = "(" + whereclause + ") AND ";
        }
    }
    return whereclause;
};

module.exports.checkTeamAdmin = function (username, team, callback) {
    const DIULibrary = require("diu-data-functions");
    const TeamModel = new DIULibrary.Models.TeamModel();
    if (!team.responsiblepeople) {
        TeamModel.getByCode(team.code, (err, result) => {
            if (err) {
                callback(err);
            } else {
                if (result.Items) {
                    const foundTeam = result.Items[0];
                    if (foundTeam.responsiblepeople) {
                        const user = foundTeam.responsiblepeople.find((person) => {
                            return person === username;
                        });
                        if (user) {
                            callback(null, true);
                        } else {
                            callback(null, false);
                        }
                    } else {
                        callback(null, false);
                    }
                } else {
                    callback(null, false);
                }
            }
        });
    } else if (team.responsiblepeople) {
        const user = team.responsiblepeople.find((person) => {
            return person === username;
        });
        if (user) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    } else {
        callback(null, false);
    }
};
