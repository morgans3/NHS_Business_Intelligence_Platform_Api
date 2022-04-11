// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const TeamModel = new DIULibrary.Models.TeamModel();

/**
 * @swagger
 * tags:
 *   name: TeamProfiles
 *   description: Profiles of this type
 */

/**

/**
 * @swagger
 * /teamprofiles/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new Profile
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: team Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: team Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: team Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisationcode
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: responsiblepeople
 *         description: People who administer this Profile
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *     responses:
 *       200:
 *         description: Confirmation of new Profile Registration
 */
router.post("/register", passport.authenticate("jwt", {
  session: false,
}), (req, res) => { res.redirect(307, '/teams/create'); });

/**
 * @swagger
 * /teamprofiles/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get("/getAll", (req, res) => { res.redirect(301, '/teams'); });

/**
 * @swagger
 * /teamprofiles/update?profile_id={profile_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates a Profile
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: profile_id
 *         description: Profile's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: code
 *         description: team Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: team Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: team Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisationcode
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: responsiblepeople
 *         description: People who administer this Profile
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *     responses:
 *       200:
 *         description: Confirmation of App Registration
 */
router.put("/update", passport.authenticate("jwt", {
  session: false,
}), (req, res) => { res.redirect(307, '/teams/update?profile_id=' + req.query.profile_id); });

/**
 * @swagger
 * /teamprofiles/getTeamByCode?code={code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the profile for a Team
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Teams Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTeamByCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const code = req.query.code;
    TeamModel.getByCode(code, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send(JSON.stringify([]));
        }
      }
    });
  }
);

/**
 * @swagger
 * /teamprofiles/getTeamsByOrgCode?orgcode={orgcode}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the teams associated to the Organisation
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: orgcode
 *         description: Organisation's Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTeamsByOrgCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const orgcode = req.query.orgcode;
    TeamModel.getByOrg(orgcode, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send(JSON.stringify([]));
        }
      }
    });
  }
);

/**
 * @swagger
 * /teamprofiles/getTeamsByPartialTeamName?partialteam={partialteam}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the teams that match the search criteria
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: partialteam
 *         description: Partial Team Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTeamsByPartialTeamName",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const partialteam = req.query.partialteam;
    TeamModel.get({
      name: partialteam
    }, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send(JSON.stringify([]));
        }
      }
    });
  }
);

/**
 * @swagger
 * /teamprofiles/getTeamsByPartialTeamNameAndOrgCode?orgcode={orgcode}&partialteam={partialteam}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the teams that match the search criteria
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: orgcode
 *         description: Organisation Code
 *         in: query
 *         required: true
 *         type: string
 *       - name: partialteam
 *         description: Partial Team Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTeamsByPartialTeamNameAndOrgCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const orgcode = req.url.split("=")[1].replace("&partialteam", "");
    const partialteam = req.url.split("=")[2];
    TeamModel.get({
      name: partialteam,
      orgcode: orgcode
    }, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send(JSON.stringify([]));
        }
      }
    });
  }
);

/**
 * @swagger
 * /teamprofiles/archive?profile_id={profile_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Profile
 *     tags:
 *      - TeamProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: profile_id
 *         description: Profile's ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Member being Archived
 */
router.put(
  "/archive",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.profile_id;
    TeamModel.getByKeys({ _id: id }, (err, result) => {
      //Output error
      if (err) { res.json({ success: false, msg: "Failed to archive: " + err }); }

      //Item exists?
      if (result.Items.length > 0) {
        //Delete item
        TeamModel.delete({ _id: id }, (err) => {
          if (err) { res.json({ success: false, msg: "Failed to remove: " + err}); }
          res.json({ success: true, msg: "Profile removed" });
        });
      } else {
        res.json({ success: false,msg: "Can not find item in database" });
      }
    });
  }
);

module.exports = router;
