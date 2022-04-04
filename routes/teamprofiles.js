// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Profiles = require("../models/teamprofiles");

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
router.post(
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let newProfile = {
      code: { S: req.body.code },
      name: { S: req.body.name },
      description: { S: req.body.description },
      organisationcode: { S: req.body.organisationcode },
    };
    if (req.body.responsiblepeople) newProfile["responsiblepeople"] = { SS: req.body.responsiblepeople.split(",") };
    Profiles.addTeam(newProfile, (err, method) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to register: " + err,
        });
      } else {
        res.json({
          success: true,
          msg: "Registered",
        });
      }
    });
  }
);

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
router.get(
  "/getAll",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    Profiles.getAll(function (err, result) {
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
    Profiles.getTeamByCode(code, function (err, result) {
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
    Profiles.getTeamsByOrg(orgcode, function (err, result) {
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
    Profiles.getTeamsByPartialTeamName(partialteam, function (err, result) {
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
    Profiles.getTeamsByPartialTeamNameAndOrgCode(partialteam, orgcode, function (err, result) {
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
    Profiles.getTeamById(id, function (err, result) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      if (result.Items.length > 0) {
        var item = result.Items[0];
        Profiles.remove(item, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to remove: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Profile removed",
          });
        });
      } else {
        res.json({
          success: false,
          msg: "Can not find item in database",
        });
      }
    });
  }
);

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
router.put(
  "/update",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.profile_id;
    Profiles.getTeamById(id, function (err, result) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to update: " + err,
        });
      }

      if (result.Items.length > 0) {
        var profile = result.Items[0];
        profile.code = req.body.code;
        profile.name = req.body.name;
        profile.description = req.body.description;
        profile.organisationcode = req.body.organisationcode;
        profile.responsiblepeople = req.body.responsiblepeople;

        Profiles.update(profile, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to update: " + err,
            });
          }
          res.json({
            success: true,
            msg: "App updated",
          });
        });
      } else {
        res.json({
          success: false,
          msg: "Can not find item in database",
        });
      }
    });
  }
);

module.exports = router;
