// @ts-check

var ActiveDirectory = require("activedirectory");
const credentials = require("../_credentials/credentials");
const Request = require("request");
const jwt = require("jsonwebtoken");
const AWS = require("../config/database").AWS;
const DIULibrary = require("diu-data-functions");
const User = new DIULibrary.Models.UserModel(AWS);
const UserRoles = new DIULibrary.Models.UserRoleModel(AWS);
const TeamRoles = new DIULibrary.Models.TeamRoleModel(AWS);
const HashHelper = DIULibrary.Helpers.Hash;

let returnUser, token, options, tokenA, tempUser;
const access = process.env.AWSPROFILE || "Dev";

const userfields = ["manager", "distinguishedName", "userPrincipalName", "sAMAccountName", "mail", "lockoutTime", "whenCreated", "pwdLastSet", "userAccountControl", "employeeID", "sn", "givenName", "initials", "cn", "displayName", "comment", "description", "linemanager", "objectSid"];
const groupfields = ["distinguishedName", "objectCategory", "cn", "description"];

// @ts-ignore
const adLCSU = new ActiveDirectory({
  url: "ldap://10.212.120.150",
  baseDN: "dc=xlcsu,dc=nhs,dc=uk",
  bindDN: credentials.lcsuauth,
  bindCredentials: credentials.lcsupass,
  attributes: {
    user: userfields,
    group: groupfields,
  },
  entryParser(entry, raw, callback) {
    if (raw.hasOwnProperty("objectGUID")) {
      entry.objectGUID = raw.objectGUID;
    }
    if (raw.hasOwnProperty("objectSid")) {
      entry.objectSid = raw.objectSid;
    }
    callback(entry);
  },
});

// @ts-ignore
const adXMLCSU = new ActiveDirectory({
  url: "ldap://10.212.120.50",
  baseDN: "dc=xmlcsu,dc=nhs,dc=uk",
  bindDN: credentials.xmlcsuauth,
  bindCredentials: credentials.xmlcsupass,
  attributes: {
    user: userfields,
    group: groupfields,
  },
  entryParser(entry, raw, callback) {
    if (raw.hasOwnProperty("objectGUID")) {
      entry.objectGUID = raw.objectGUID;
    }
    if (raw.hasOwnProperty("objectSid")) {
      entry.objectSid = raw.objectSid;
    }
    callback(entry);
  },
});

// @ts-ignore
const adXFyldeCoast = new ActiveDirectory({
  url: "ldap://10.164.32.24:389",
  baseDN: "ou=ADUsers,dc=xfyldecoast,dc=nhs,dc=uk",
  bindDN: credentials.ldapauth,
  bindCredentials: credentials.ldappass,
  attributes: {
    user: userfields,
    group: groupfields,
  },
  entryParser(entry, raw, callback) {
    if (raw.hasOwnProperty("objectGUID")) {
      entry.objectGUID = raw.objectGUID;
    }
    if (raw.hasOwnProperty("objectSid")) {
      entry.objectSid = raw.objectSid;
    }
    callback(entry);
  },
});

// @ts-ignore
const adRegion = new ActiveDirectory({
  url: "ldap://10.164.32.24:3268",
  baseDN: "dc=nhs,dc=uk",
  bindDN: credentials.ldapauth,
  bindCredentials: credentials.ldappass,
  attributes: {
    user: userfields,
    group: groupfields,
  },
  entryParser(entry, raw, callback) {
    if (raw.hasOwnProperty("objectGUID")) {
      entry.objectGUID = raw.objectGUID;
    }
    if (raw.hasOwnProperty("objectSid")) {
      entry.objectSid = raw.objectSid;
    }
    callback(entry);
  },
});

// @ts-ignore
const adNWAS = new ActiveDirectory({
  url: "ldap://10.238.1.132:3268",
  baseDN: "dc=nhs,dc=uk",
  bindDN: credentials.nwasldapauth,
  bindCredentials: credentials.nwasldappass,
  attributes: {
    user: userfields,
    group: groupfields,
  },
  entryParser(entry, raw, callback) {
    if (raw.hasOwnProperty("objectGUID")) {
      entry.objectGUID = raw.objectGUID;
    }
    if (raw.hasOwnProperty("objectSid")) {
      entry.objectSid = raw.objectSid;
    }
    callback(entry);
  },
});

const usernameADLogin = function (username, password, organisation, authentication, activedirectory, filter, callback) {
  activedirectory.findUser(username, function (err, user) {
    if (err) {
      callback(true, JSON.stringify(err));
      console.log(username + " ERROR: " + JSON.stringify(err));
      return;
    }
    let filteredUsers = user;
    if (filter && (!filteredUsers || filteredUsers.length == 0)) {
      filteredUsers = user.filter((u) => u.distinguishedName.indexOf(filter) > -1);
    }
    if (!user) {
      callback(true, "ERROR: " + "User: " + username + " has not been found.");
      console.log(username + " ERROR: user not found");
      return;
    } else {
      activedirectory.authenticate(user.userPrincipalName, password, function (err, auth) {
        if (err) {
          callback(true, "ERROR: " + JSON.stringify(err));
          console.log(username + " ERROR: " + JSON.stringify(err));
          return;
        }
        if (auth) {
          tempUser = {
            _id: sidBufferToString(user.objectSid),
            name: user.cn,
            username: user.sAMAccountName,
            email: user.mail,
            organisation: organisation,
            authentication: authentication,
          };
          tokenA = jwt.sign(tempUser, credentials.secret, {
            expiresIn: 604800, //1 week
          });
          options = {
            headers: {
              authorization: "JWT " + tokenA,
            },
          };
          let subdomain = "";
          if (access === "Dev") {
            subdomain = "dev.";
          } else if (access === "Test") {
            subdomain === "demo.";
          }
          try {
            Request.get("https://usergroup." + subdomain + "nexusintelligencenw.nhs.uk" + "/teammembers/getTeamMembershipsByUsername?username=" + user.sAMAccountName, options, (error, response, body) => {
              if (error) {
                callback(true, "Error checking memberships, reason: " + error);
                console.log(username + " ERROR Memberships: " + JSON.stringify(error));
                return;
              }
              let memberships = [];
              try {
                if (body) {
                  memberships = JSON.parse(body);
                }
              } catch (ex) { }
              returnUser = {
                _id: sidBufferToString(user.objectSid),
                name: user.cn,
                username: user.sAMAccountName,
                email: user.mail,
                organisation: organisation,
                authentication: authentication,
                memberships: memberships,
              };
              token = jwt.sign(returnUser, credentials.secret, {
                expiresIn: 604800, //1 week
              });
              callback(null, token);
              return;
            });
          } catch (error) {
            callback(true, error.toString());
            console.log(username + " ERROR Memberships: " + JSON.stringify(error.toString()));
            return;
          }
        } else {
          callback(true, "Wrong Password");
          console.log(username + " ERROR: wrong password");
          return;
        }
      });
    }
  });
};

const emailADLogin = function (username, password, organisation, authentication, activedirectory, filter, callback) {
  const personquery = "(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group)))";
  const emailquery = "(mail=" + username + ")";
  const fullquery = "(&" + emailquery + personquery + ")";
  activedirectory.findUsers(fullquery, function (err, user) {
    if (err) {
      callback(true, JSON.stringify(err));
      console.log(username + " ERROR: " + JSON.stringify(err));
      return;
    }
    let filteredUsers = user;
    if (filter && (!filteredUsers || filteredUsers.length == 0)) {
      filteredUsers = user.filter((u) => u.distinguishedName.indexOf(filter) > -1);
    }
    if (!filteredUsers || filteredUsers.length == 0) {
      callback(true, "User: " + username + " not found.");
      console.log(username + " ERROR: user not found");
      return;
    } else {
      activedirectory.authenticate(user[0].userPrincipalName, password, function (error, auth) {
        if (error) {
          callback(true, JSON.stringify(error));
          console.log(username + " ERROR: " + JSON.stringify(error));
          return;
        }
        if (auth) {
          let subdomain = "";
          if (access === "Dev") {
            subdomain = "dev.";
          } else if (access === "Test") {
            subdomain === "demo.";
          }
          tempUser = {
            _id: sidBufferToString(user[0].objectSid),
            name: user[0].cn,
            username: user[0].sAMAccountName,
            email: user[0].mail,
            organisation: organisation,
            authentication: authentication,
          };
          tokenA = jwt.sign(tempUser, credentials.secret, {
            expiresIn: 604800, //1 week
          });
          options = {
            headers: {
              authorization: "JWT " + tokenA,
            },
          };
          try {
            Request.get("https://usergroup." + subdomain + "nexusintelligencenw.nhs.uk" + "/teammembers/getTeamMembershipsByUsername?username=" + user[0].sAMAccountName, options, (error, response, body) => {
              if (error) {
                callback(true, "Error checking memberships, reason: " + error);
                console.log(username + " ERROR Memberships: " + JSON.stringify(error));
                return;
              }
              let memberships = [];
              try {
                if (body) {
                  memberships = JSON.parse(body);
                }
              } catch (ex) { }
              returnUser = {
                _id: sidBufferToString(user[0].objectSid),
                name: user[0].cn,
                username: user[0].sAMAccountName,
                email: user[0].mail,
                organisation: organisation,
                authentication: authentication,
                memberships: memberships,
              };
              token = jwt.sign(returnUser, credentials.secret, {
                expiresIn: 604800, //1 week
              });
              callback(null, token);
              return;
            });
          } catch (error) {
            callback(true, error.toString());
            console.log(username + " ERROR Memberships: " + JSON.stringify(error.toString()));
            return;
          }
        } else {
          callback(true, "Wrong Password");
          console.log(username + " ERROR: wrong password");
          return;
        }
      });
    }
  });
};

module.exports.upgradePassport = function (previousToken, mfa, callback) {
  const myRoles = [];
  UserRoles.getItemsByUsername(previousToken.username, async (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      if (result.Items && result.Items.length > 0) {
        result.Items.forEach((role) => {
          if (role.role) {
            myRoles.push(role.role);
          }
        });
      }
      if (previousToken.memberships.length > 0) {
        // Add Team Roles
        const teams = previousToken.memberships.map((x) => x.teamcode);
        TeamRoles.getItemsByTeamcodes(teams, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            if (result.Items && result.Items.length > 0) {
              result.Items.forEach((role) => {
                if (role.role) {
                  myRoles.push(role.role);
                }
              });
            }
            const upgrade = {
              _id: previousToken._id,
              name: previousToken.name,
              username: previousToken.username,
              email: previousToken.email,
              organisation: previousToken.organisation,
              authentication: previousToken.authentication,
              memberships: previousToken.memberships,
              mfa: mfa,
              capabilties: myRoles,
            };
            token = jwt.sign(upgrade, credentials.secret, {
              expiresIn: 86400, //1 day
            });
            callback(null, token);
          }
        });
      } else {
        const upgrade = {
          _id: previousToken._id,
          name: previousToken.name,
          username: previousToken.username,
          email: previousToken.email,
          organisation: previousToken.organisation,
          authentication: previousToken.authentication,
          memberships: previousToken.memberships,
          mfa: mfa,
          capabilties: myRoles,
        };
        token = jwt.sign(upgrade, credentials.secret, {
          expiresIn: 86400, //1 day
        });
        callback(null, token);
      }
    }
  });
};

module.exports.upgradePassportwithOrganisation = function (previousToken, mfa, callback) {
  const myRoles = [];
  UserRoles.getItemsByUsernameAndOrgID(previousToken.username, previousToken._id, async (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      if (result.Items && result.Items.length > 0) {
        result.Items.forEach((role) => {
          if (role.role) {
            myRoles.push(role.role);
          }
        });
      }
      if (previousToken.memberships.length > 0) {
        // Add Team Roles
        const teams = previousToken.memberships.map((x) => x.teamcode);
        TeamRoles.getItemsByTeamcodes(teams, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            if (result.Items && result.Items.length > 0) {
              result.Items.forEach((role) => {
                if (role.role) {
                  myRoles.push(role.role);
                }
              });
            }
            const upgrade = {
              _id: previousToken._id,
              name: previousToken.name,
              username: previousToken.username,
              email: previousToken.email,
              organisation: previousToken.organisation,
              authentication: previousToken.authentication,
              memberships: previousToken.memberships,
              mfa: mfa,
              capabilties: myRoles,
            };
            token = jwt.sign(upgrade, credentials.secret, {
              expiresIn: 86400, //1 day
            });
            callback(null, token);
          }
        });
      } else {
        const upgrade = {
          _id: previousToken._id,
          name: previousToken.name,
          username: previousToken.username,
          email: previousToken.email,
          organisation: previousToken.organisation,
          authentication: previousToken.authentication,
          memberships: previousToken.memberships,
          mfa: mfa,
          capabilties: myRoles,
        };
        token = jwt.sign(upgrade, credentials.secret, {
          expiresIn: 86400, //1 day
        });
        callback(null, token);
      }
    }
  });
};

let pad = function (s) {
  if (s.length < 2) {
    return `0${s}`;
  } else {
    return s;
  }
};

let sidBufferToString = function (buf) {
  let asc, end;
  let i;
  if (buf == null) {
    return null;
  }

  let version = buf[0];
  let subAuthorityCount = buf[1];
  let identifierAuthority = parseInt(
    (() => {
      let result = [];
      for (i = 2; i <= 7; i++) {
        result.push(buf[i].toString(16));
      }
      return result;
    })().join(""),
    16
  );

  let sidString = `S-${version}-${identifierAuthority}`;

  for (i = 0, end = subAuthorityCount - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
    let subAuthOffset = i * 4;
    let tmp = pad(buf[11 + subAuthOffset].toString(16)) + pad(buf[10 + subAuthOffset].toString(16)) + pad(buf[9 + subAuthOffset].toString(16)) + pad(buf[8 + subAuthOffset].toString(16));
    sidString += `-${parseInt(tmp, 16)}`;
  }

  return sidString;
};

module.exports.authenticateDemo = function (user, callback) {
  tokenA = jwt.sign(JSON.parse(JSON.stringify(user)), credentials.secret, {
    expiresIn: 604800, //1 week
  });
  options = {
    headers: {
      authorization: "JWT " + tokenA,
    },
  };
  let subdomain = "";
  if (access === "Dev") {
    subdomain = "dev.";
  } else if (access === "Test") {
    subdomain === "demo.";
  }
  Request.get("https://usergroup." + subdomain + "nexusintelligencenw.nhs.uk" + "/teammembers/getTeamMembershipsByUsername?username=" + user.username, options, (error, response, body) => {
    if (error) {
      callback(true, "Error checking memberships, reason: " + error);
      return;
    }
    let memberships = [];
    try {
      if (body) {
        try {
          if (body) {
            memberships = JSON.parse(body);
          }
        } catch (ex) { }
        const id = user._id || user.username + "_Collaborative Partners";
        returnUser = {
          _id: id,
          name: user.name,
          username: user.username,
          email: user.email,
          organisation: "Collaborative Partners",
          authentication: "Demo",
          memberships: memberships,
        };
        token = jwt.sign(returnUser, credentials.secret, {
          expiresIn: 604800, //1 week
        });
        callback(null, token);
        return;
      }
    } catch (ex) {
      callback(true, "Error checking memberships, reason: " + ex);
      return;
    }
  });
};
