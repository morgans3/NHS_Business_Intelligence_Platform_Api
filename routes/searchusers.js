// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const organisations = require("../models/authenticate").organisations;
const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();

/**
 * @swagger
 * tags:
 *   name: SearchUsers
 *   description: Search for users of the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /searchusers/searchUserProfiles?searchterm={searchterm}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SearchUsers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: searchterm
 *         description: Search Term
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Search Results
 */
router.get(
  "/searchUserProfiles",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const search = req.query.searchterm;
    let searchresults = [];
    UserModel.getUserByPartialUsername(search, function (err, users) {
      if (err) {
        console.log("ERROR: " + JSON.stringify(err));
        res.send({ status: 503, message: "Organisation service not available" });
      } else {
        let response = [];
        users.Items.forEach((element) => {
          response.push({
            name: element.name,
            email: element.email,
            username: element.username,
          });
        });
        searchresults.push({
          name: "Collaborative Partners",
          results: response,
        });
        res.send(searchresults);
      }
    });
  }
);

/**
 * @swagger
 * /searchusers/searchOrgUserProfiles?searchterm={searchterm}&organisation={organisation}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SearchUsers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: searchterm
 *         description: Search Term
 *         in: query
 *         required: true
 *         type: string
 *       - name: organisation
 *         description: Search Organisation
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Search Results
 */
router.get(
  "/searchOrgUserProfiles",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const search = req.query.searchterm;
    const organisation = req.query.organisation;
    let searchresults = [];
    const personquery = "(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group)))";
    const emailquery = "(|(mail=" + search + "*)(displayName=" + search + "*)(cn=" + search + "*)(sAMAccountName=" + search + "*))";
    const fullquery = "(&" + emailquery + personquery + ")";
    switch (organisation) {
      case "Demo":
      case "Collaborative Partners":
      case "Admin":
        UserModel.getUserByPartialUsername(search, function (err, users) {
          if (err) {
            console.log("ERROR: " + JSON.stringify(err));
            res.send({ status: 503, message: "Organisation service not available" });
          } else {
            let response = [];
            users.Items.forEach((element) => {
              response.push({
                name: element.name,
                email: element.email,
                username: element.username,
                organisation: element.organisation,
                linemanager: element.linemanager,
              });
            });
            searchresults.push({
              name: organisation,
              results: response,
            });
            res.send(searchresults);
          }
        });
        break;
      default:
        const org = organisations.find((x) => x.name === organisation);
        if (!org) {
          res.send({ status: 404, message: "Organisation not found" });
        } else {
          // @ts-ignore
          org.org.findUsers(fullquery, function (err, user) {
            if (err) {
              console.log("ERROR: " + JSON.stringify(err));
              res.send({ status: 503, message: "Organisation service not available" });
            } else {
              if (user && user.length > 0) {
                let responseAD = [];
                user.forEach((staff) => {
                  responseAD.push({
                    _id: sidBufferToString(staff.objectSid),
                    name: staff.cn,
                    email: staff.mail,
                    username: staff.sAMAccountName,
                  });
                });
                searchresults.push({
                  name: org.name,
                  results: responseAD,
                });
              }
              res.send(searchresults);
            }
          });
        }
        break;
    }
  }
);

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

module.exports = router;
