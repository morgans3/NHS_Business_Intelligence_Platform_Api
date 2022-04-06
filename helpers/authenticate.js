const jwt = require("jsonwebtoken");
const request = require("request");
const access = process.env.AWSPROFILE || "Dev";
const credentials = require("../_credentials/credentials");
const ActiveDirectory = require("activedirectory");
const activeDirectoryConfig = require("../config/active_directory");

const DIULibrary = require("diu-data-functions");
const HashHelper = DIULibrary.Helpers.Hash;
const StringHelper = DIULibrary.Helpers.String;
const UserModel = new DIULibrary.Models.UserModel();
const AccessLogModel = new DIULibrary.Models.AccessLog();
const nexusAuthMethods = ['Demo', 'Nexus'];

class Authenticate {

    static generateJWT(user, callback) {
        //Create jwt
        let jwtToken = jwt.sign(JSON.parse(JSON.stringify(user)), credentials.secret, {
            expiresIn: 604800, //1 week
        });

        //Get user's teams
        request.get(`https://usergroup.${(access === "Dev" ? "dev" : (access === "Test" ? "demo" : ""))}.nexusintelligencenw.nhs.uk/teammembers/getTeamMembershipsByUsername?username=${user.username}`, {
            headers: {
                authorization: "JWT " + jwtToken,
            }
        }, (error, response, body) => {
            if (error) {
                callback(true, "Error checking memberships, reason: " + error);
                return;
            }

            try {
                if (body) {
                    //Parse memberships
                    user.memberships = [];
                    try {
                        user.memberships = body ? JSON.parse(body) : user.memberships;
                    } catch (error) { }

                    //Return JWT
                    callback(false, jwt.sign({
                        _id: user._id || user.username + "_" + user.organisation,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        organisation: user.organisation,
                        authentication: user.authentication,
                        memberships: user.memberships,
                    }, credentials.secret, {
                        expiresIn: 604800, //1 week
                    }));
                    return;
                }
            } catch (error) {
                callback(true, "Error checking memberships, reason: " + error); return;
            }
        });
    }

    static login(authentication, username, password, organisation, loginCallback) {
        //Check login type
        if (username.includes("@")) {
            this.loginEmail(authentication, username, password, organisation, (err, response) => {
                loginCallback(err, response);
            });
        } else {
            this.loginUsername(authentication, username, password, organisation, (err, response) => {
                loginCallback(err, response);
            });
        }
    }

    //Login with username
    static loginUsername(authentication, username, password, organisation, loginCallback) {
        //Declare user object
        let authenticatedUser;

        //Check for Nexus user
        if (!nexusAuthMethods.includes(authentication)) {
            //Check organisation exists
            if (!activeDirectoryConfig.org_settings[authentication]) {
                loginCallback("Unknown Organisation", null); return;
            }

            //Login with AD
            authenticatedUser = ((callback) => {
                //Create AD object
                let activeDirectory = new ActiveDirectory(activeDirectoryConfig.org_settings[authentication]);

                //Get AD user
                activeDirectory.findUser(username, (err, user) => {
                    //Failed to find user
                    if (err) { callback(JSON.stringify(err), null); return; }

                    //Check if user found
                    if (!user) {
                        //User not found
                        callback("Error: " + "user: " + username + " has not been found.", null); return;
                    } else {
                        //Authenticate with password
                        activeDirectory.authenticate(user.userPrincipalName, password, function (err, auth) {
                            //Error occurred
                            if (err) { callback("Error: " + (err.description || JSON.stringify(err)), null); return; }

                            if (auth) {
                                //Add/Update user
                                (new DIULibrary.Models.UserModel()).updateOrCreate({
                                    username: user.sAMAccountName,
                                    organisation: organisation
                                }, {
                                    email: user.mail,
                                    name: user.cn,
                                    auth_method: authentication
                                }, (err) => { if (err) { console.log(err); } });

                                //Return user
                                callback(false, {
                                    _id: StringHelper.sidBufferToString(user.objectSid),
                                    name: user.cn,
                                    username: user.sAMAccountName,
                                    email: user.mail,
                                    organisation: organisation,
                                    authentication: authentication,
                                });
                            } else {
                                callback("Wrong Password", null); return;
                            }
                        });
                    }
                });
            });
        } else {
            //Login with Nexus
            authenticatedUser = ((callback) => {
                //Get user
                UserModel.getUserByUsername(username, (err, data) => {
                    //Failed to find user
                    if (err) { callback(err, null); return; }

                    //Declare user
                    var user = data.Items ? data.Items[0] : null;
                    if (user == null) {
                        callback("User not found", null); return;
                    }

                    //Check user auth method
                    if (user.auth_method && !nexusAuthMethods.includes(user.auth_method)) {
                        callback("Wrong authentication method!", null); return;
                    }

                    //Check user password
                    HashHelper.check(password, user.password, (err, isMatch) => {
                        if (err) { callback(err, null); return; }

                        //Check for match
                        if (isMatch) {
                            callback(false, user);
                        } else {
                            callback("Wrong Password", null); return;
                        }
                    });
                });
            });
        }

        //Get user and return JWT
        authenticatedUser((err, user) => {
            if (err) {
                loginCallback(err, null); return;
            } else {
                this.generateJWT(user, (err, jwt) => {
                    if (err) {
                        loginCallback(err, null); return;
                    } else {
                        //Record access log
                        AccessLogModel.create({
                            type: "Login",
                            user: {
                                username: user.username,
                                organisation: user.organisation
                            }
                        }, (err) => {
                            //Return success
                            if (err) { console.log(err); }
                            loginCallback(false, Object.assign(user, { jwt: jwt })); return;
                        });
                    }
                })
            }
        });
    }

    //Login with email
    static loginEmail(authentication, username, password, organisation, loginCallback) {
        //Declare user object
        let authenticatedUser;

        //Check for Nexus user
        if (!nexusAuthMethods.includes(authentication)) {
            //Check organisation exists
            if (!activeDirectoryConfig.org_settings[authentication]) {
                loginCallback("Unknown Organisation", null); return;
            }

            //Login with AD
            authenticatedUser = ((callback) => {
                //Create AD object
                let activeDirectory = new ActiveDirectory(activeDirectoryConfig.org_settings[authentication]);

                //Find user by email
                const personquery = "(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group)))";
                const emailquery = "(mail=" + username + ")";
                const fullquery = "(&" + emailquery + personquery + ")";
                activeDirectory.findUsers(fullquery, function (err, users) {
                    //Return error
                    if (err) { callback(JSON.stringify(err), null); return; }

                    //User found?
                    if (users == null || users.length == 0) {
                        //User not found
                        callback("Error: " + "user: " + username + " has not been found.", null); return;
                    } else {
                        //Authenticate with password
                        activeDirectory.authenticate(users[0].userPrincipalName, password, function (err, auth) {
                            //Error occurred
                            if (err) { callback("Error: " + (err.description || JSON.stringify(err)), null); return; }

                            if (auth) {
                                //Add/Update user
                                (new DIULibrary.Models.UserModel()).updateOrCreate({
                                    username: users[0].sAMAccountName,
                                    organisation: organisation
                                }, {
                                    email: users[0].mail,
                                    name: users[0].cn,
                                    auth_method: authentication,
                                }, (err) => { if (err) { console.log(err); } });

                                //Return user
                                callback(false, {
                                    _id: StringHelper.sidBufferToString(users[0].objectSid),
                                    name: users[0].cn,
                                    username: users[0].sAMAccountName,
                                    email: users[0].mail,
                                    organisation: organisation,
                                    authentication: authentication,
                                });
                            } else {
                                callback("Wrong Password", null); return;
                            }
                        });
                    }
                });
            });
        } else {
            //Login with Nexus
            authenticatedUser = ((callback) => {
                //Get user
                UserModel.getUserByEmail(username, (err, data) => {
                    //Failed to find user
                    if (err) { callback(err, null); return; }

                    //User found?
                    if (data === null) { callback("Email not found", null); }

                    //Declare user
                    var user = data.Items ? data.Items[0] : null;
                    if (user == null) {
                        callback("User not found", null); return;
                    }

                    //Check user auth method
                    if (user.auth_method && !nexusAuthMethods.includes(user.auth_method)) {
                        callback("Wrong authentication method!", null); return;
                    }

                    //Check user password
                    HashHelper.check(password, user.password, (err, isMatch) => {
                        if (err) { callback(err, null); return; }

                        //Check for match
                        if (isMatch) {
                            callback(false, user);
                        } else {
                            callback("Wrong Password", null); return;
                        }
                    });
                });
            });
        }

        //Get user and return JWT
        authenticatedUser((err, user) => {
            if (err) {
                loginCallback(err, null); return;
            } else {
                this.generateJWT(user, (err, jwt) => {
                    if (err) {
                        loginCallback(err, null); return;
                    } else {
                        //Record access log
                        AccessLogModel.create({
                            type: "Login",
                            user: {
                                username: user.username,
                                organisation: user.organisation
                            }
                        }, (err) => {
                            //Return success
                            if (err) { console.log(err); }
                            loginCallback(false, Object.assign(user, { jwt: jwt })); return;
                        });
                    }
                })
            }
        });
    }
}

module.exports = Authenticate;