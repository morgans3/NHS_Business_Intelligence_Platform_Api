// @ts-check

const credentials = require("../_credentials/credentials");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UserRoles = require("../models/userroles");
const TeamRoles = require("../models/teamroles");
const Members = require("../models/teammembers");
let token;

module.exports.loginUsername = function (authentication, username, password, organisation, callback) {
  switch (authentication) {
    // Option to add in more authentication methods here (for example: Active Directory)
    default:
      User.getUserByUsername(username, (err, data) => {
        if (err) {
          callback(true, err);
          return;
        }
        var user;
        if (data.Items) {
          user = data.Items[0];
        }
        if (!user) {
          callback(true, "User not found");
          return;
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
          if (err) {
            callback(true, err);
            return;
          }
          if (isMatch) {
            const id = user._id || user.username + "_" + organisation;
            getTeamMembershipsByUsername(user.username, (err, memberships) => {
              if (err) {
                console.error(err);
              }
              const returnUser = {
                _id: id,
                name: user.name,
                username: user.username,
                email: user.email,
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
          } else {
            callback(true, "Wrong Password");
            return;
          }
        });
      });
      break;
  }
};

module.exports.loginEmail = function (authentication, email, password, organisation, callback) {
  switch (authentication) {
    default:
      User.getUserByEmail(email, (err, data) => {
        if (err) {
          callback(true, err);
          return;
        }
        if (data === null) {
          callback(true, "Email not found");
        }
        var user;
        if (data.Items) {
          user = data.Items[0];
        }
        if (!user) {
          callback(true, "Email not found");
          return;
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
          if (err) {
            callback(true, err);
            return;
          }
          if (isMatch) {
            const id = user._id || user.username + "_" + organisation;
            getTeamMembershipsByUsername(user.username, (err, memberships) => {
              if (err) {
                console.error(err);
              }
              const returnUser = {
                _id: id,
                name: user.name,
                username: user.username,
                email: user.email,
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
          } else {
            callback(true, "Wrong Password");
            return;
          }
        });
      });
      break;
  }
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

module.exports.authenticateDemo = function (user, callback) {
  const id = user._id || user.username + "_Collaborative Partners";
  getTeamMembershipsByUsername(user.username, (err, memberships) => {
    if (err) {
      console.error(err);
    }
    const returnUser = {
      _id: id,
      name: user.name,
      username: user.username,
      email: user.email,
      organisation: "Collaborative Partners",
      authentication: "demo",
      memberships: memberships,
    };
    token = jwt.sign(returnUser, credentials.secret, {
      expiresIn: 604800, //1 week
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
