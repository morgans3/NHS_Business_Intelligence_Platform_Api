// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const OrganisationModel = new DIULibrary.Models.OrganisationModel();
const ActiveDirectoryModel = new DIULibrary.Models.ActiveDirectoryModel();
const StringHelper = DIULibrary.Helpers.String;

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
        OrganisationModel.get({ name: organisation }, (err, data) => {
          //Organisation exists?
          if(data.Items.length == 0) {
            res.send({ status: 404, message: "Organisation not found" }); return; 
          }
          
          //Query via active directory
          let organisation = data.Items[0];
          ActiveDirectoryModel.getInstance(organisation.authmethod, (err, activeDirectory) => {
            //Handle error type?
            if(err) { res.send({ status: 500, message: err }); return; }

            //Find users
            activeDirectory.findUsers(fullquery, function (err, user) {
              if (err) {
                console.log("ERROR: " + JSON.stringify(err));
                res.send({ status: 503, message: "Organisation service not available" });
              } else {
                if (user && user.length > 0) {
                  let responseAD = [];
                  user.forEach((staff) => {
                    responseAD.push({
                      _id: StringHelper.sidBufferToString(staff.objectSid),
                      name: staff.cn,
                      email: staff.mail,
                      username: staff.sAMAccountName,
                    });
                  });
                  searchresults.push({
                    name: organisation.name,
                    results: responseAD,
                  });
                }
                res.send(searchresults);
              }
            });
          });
        });
        break;
    }
  }
);

module.exports = router;
