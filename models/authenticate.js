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

module.exports.organisations = [
  { name: "xfyldecoast", org: adXFyldeCoast, displayname: "Fylde Coast" },
  { name: "xmlcsu", org: adXMLCSU, displayname: "ML CSU" },
  { name: "lcsu", org: adLCSU, displayname: "West Lancs", filter: "West Lancashire" },
  { name: "global", org: adRegion, displayname: "LSC Region" },
  { name: "uhmbt", org: adRegion, displayname: "Morecambe Bay" },
  { name: "nwas", org: adNWAS, displayname: "NWAS" },
];