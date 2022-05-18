const jwt = require("jsonwebtoken");
const credentials = require("../_credentials/credentials");

const DIULibrary = require("diu-data-functions");
const HashHelper = DIULibrary.Helpers.Hash;
const StringHelper = DIULibrary.Helpers.StringMethods;
const UserModel = new DIULibrary.Models.UserModel();
const AccessLogModel = new DIULibrary.Models.AccessLog();
const ADModel = require("../models/activedirectory");
const ActiveDirectoryModel = new ADModel();
const TeamMembersModel = require("../models/teammembers");
const nexusAuthMethods = ["Demo", "Nexus"];

class Authenticate {
    static generateJWT(user, callback) {
        // Get user's teams
        TeamMembersModel.getteamsByMember(user.username, (err, memberships) => {
            // Add memberships and generate jwt
            if (err) {
                callback(err, null);
                return;
            }
            callback(
                null,
                jwt.sign(
                    {
                        _id: user["_id"] || user.username + "_" + user.organisation,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        organisation: user.organisation,
                        authentication: user.authentication,
                        memberships: memberships.Items || [],
                    },
                    credentials.secret,
                    { expiresIn: 604800 } // 604800 = 1 week
                )
            );
        });
    }

    static login(authentication, username, password, organisation, loginCallback) {
        // Check login type
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

    // Login with username
    static loginUsername(authentication, username, password, organisation, loginCallback) {
        // Declare user object
        let authenticatedUser;

        // Check for Nexus user
        if (!nexusAuthMethods.includes(authentication)) {
            // Login with AD
            authenticatedUser = (callback) => {
                // Create AD object
                ActiveDirectoryModel.getInstance(authentication, (err, activeDirectory) => {
                    if (err) {
                        loginCallback(err, null);
                        return;
                    }

                    // Get AD user
                    activeDirectory.findUser(username, (errFindUser, user) => {
                        // Failed to find user
                        if (errFindUser) {
                            callback(JSON.stringify(errFindUser), null);
                            return;
                        }

                        // Check if user found
                        if (!user) {
                            // User not found
                            callback(new Error("Error: " + "user: " + username + " has not been found."), null);
                        } else {
                            // Authenticate with password
                            activeDirectory.authenticate(user.userPrincipalName, password, function (errAuthenticate, auth) {
                                // Error occurred
                                if (errAuthenticate) {
                                    callback(new Error("Error: " + (errAuthenticate.description || JSON.stringify(errAuthenticate))), null);
                                    return;
                                }

                                if (auth) {
                                    // Add/Update user
                                    new DIULibrary.Models.UserModel().updateOrCreate(
                                        {
                                            username: user.sAMAccountName,
                                            organisation,
                                        },
                                        {
                                            email: user.mail,
                                            name: user.cn,
                                            auth_method: authentication,
                                        },
                                        (errUorC) => {
                                            if (errUorC) {
                                                console.log(errUorC);
                                            }
                                        }
                                    );

                                    // Return user
                                    callback(null, {
                                        _id: StringHelper.sidBufferToString(user.objectSid),
                                        name: user.cn,
                                        username: user.sAMAccountName,
                                        email: user.mail,
                                        organisation,
                                        authentication,
                                    });
                                } else {
                                    callback(new Error("Wrong Password"), null);
                                }
                            });
                        }
                    });
                });
            };
        } else {
            // Login with Nexus
            authenticatedUser = (callback) => {
                // Get user
                UserModel.getUserByUsername(username, (err, data) => {
                    // Failed to find user
                    if (err) {
                        callback(err, null);
                        return;
                    }

                    // Declare user
                    const user = data.Items ? data.Items[0] : null;
                    if (user == null) {
                        callback(new Error("User not found"), null);
                        return;
                    }

                    // Check user auth method
                    if (user.auth_method && !nexusAuthMethods.includes(user.auth_method)) {
                        callback(new Error("Wrong authentication method"), null);
                        return;
                    }

                    // Check user password
                    HashHelper.check(password, user.password, (errCheck, isMatch) => {
                        if (errCheck) {
                            callback(errCheck, null);
                            return;
                        }

                        // Check for match
                        if (isMatch) {
                            callback(null, user);
                        } else {
                            callback(new Error("Wrong Password"), null);
                        }
                    });
                });
            };
        }

        // Get user and return JWT
        authenticatedUser((err, user) => {
            if (err) {
                loginCallback(err, null);
            } else {
                this.generateJWT(user, (errGenerate, jwtToken) => {
                    if (errGenerate) {
                        loginCallback(errGenerate, null);
                    } else {
                        // Record access log
                        AccessLogModel.create(
                            {
                                type: "Login",
                                user: {
                                    username: user.username,
                                    organisation: user.organisation,
                                },
                            },
                            (logCreateErr) => {
                                // Return success
                                if (logCreateErr) {
                                    console.log(logCreateErr);
                                }
                                loginCallback(false, Object.assign(user, { jwt: jwtToken }));
                            }
                        );
                    }
                });
            }
        });
    }

    // Login with email
    static loginEmail(authentication, username, password, organisation, loginCallback) {
        // Declare user object
        let authenticatedUser;

        // Check for Nexus user
        if (!nexusAuthMethods.includes(authentication)) {
            // Login with AD
            authenticatedUser = (callback) => {
                // Create AD object
                ActiveDirectoryModel.getInstance(authentication, (err, activeDirectory) => {
                    if (err) {
                        loginCallback(err, null);
                        return;
                    }

                    // Find user by email
                    const personquery = "(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group)))";
                    const emailquery = "(mail=" + username + ")";
                    const fullquery = "(&" + emailquery + personquery + ")";
                    activeDirectory.findUsers(fullquery, function (errFind, users) {
                        // Return error
                        if (errFind) {
                            callback(new Error(JSON.stringify(errFind)), null);
                            return;
                        }

                        // User found?
                        if (users == null || users.length === 0) {
                            // User not found
                            callback(new Error("Error: " + "user: " + username + " has not been found."), null);
                        } else {
                            // Authenticate with password
                            activeDirectory.authenticate(users[0].userPrincipalName, password, function (errAuth, auth) {
                                // Error occurred
                                if (errAuth) {
                                    callback(new Error("Error: " + (errAuth.description || JSON.stringify(errAuth))), null);
                                    return;
                                }

                                if (auth) {
                                    // Add/Update user
                                    new DIULibrary.Models.UserModel().updateOrCreate(
                                        {
                                            username: users[0].sAMAccountName,
                                            organisation,
                                        },
                                        {
                                            email: users[0].mail,
                                            name: users[0].cn,
                                            auth_method: authentication,
                                        },
                                        (errUorC) => {
                                            if (errUorC) {
                                                console.log(errUorC);
                                            }
                                        }
                                    );

                                    // Return user
                                    callback(null, {
                                        _id: StringHelper.sidBufferToString(users[0].objectSid),
                                        name: users[0].cn,
                                        username: users[0].sAMAccountName,
                                        email: users[0].mail,
                                        organisation,
                                        authentication,
                                    });
                                } else {
                                    callback(new Error("Wrong Password"), null);
                                }
                            });
                        }
                    });
                });
            };
        } else {
            // Login with Nexus
            authenticatedUser = (callback) => {
                // Get user
                UserModel.getByEmail(username, organisation, (err, data) => {
                    // Failed to find user
                    if (err) {
                        callback(err, null);
                        return;
                    }

                    // User found?
                    if (data === null) {
                        callback(new Error("Email not found"), null);
                    }

                    // Declare user
                    const user = data.Items ? data.Items[0] : null;
                    if (user == null) {
                        callback(new Error("User not found"), null);
                        return;
                    }

                    // Check user auth method
                    if (user.auth_method && !nexusAuthMethods.includes(user.auth_method)) {
                        callback(new Error("Wrong authentication method"), null);
                        return;
                    }

                    // Check user password
                    HashHelper.check(password, user.password, (hashError, isMatch) => {
                        if (hashError) {
                            callback(hashError, null);
                            return;
                        }

                        // Check for match
                        if (isMatch) {
                            callback(null, user);
                        } else {
                            callback(new Error("Wrong Password"), null);
                        }
                    });
                });
            };
        }

        // Get user and return JWT
        authenticatedUser((err, user) => {
            if (err) {
                loginCallback(err, null);
            } else {
                this.generateJWT(user, (jwtError, jwtToken) => {
                    if (jwtError) {
                        loginCallback(jwtError, null);
                    } else {
                        // Record access log
                        AccessLogModel.create(
                            {
                                type: "Login",
                                user: {
                                    username: user.username,
                                    organisation: user.organisation,
                                },
                            },
                            (logCreateErr) => {
                                // Return success
                                if (logCreateErr) {
                                    console.log(logCreateErr);
                                }
                                loginCallback(false, Object.assign(user, { jwt: jwtToken }));
                            }
                        );
                    }
                });
            }
        });
    }
}

module.exports = Authenticate;
