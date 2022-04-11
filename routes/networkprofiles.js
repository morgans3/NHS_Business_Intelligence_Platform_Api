// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Profiles = require("../models/networkprofiles");

/**
 * @swagger
 * tags:
 *   name: NetworkProfiles
 *   description: Profiles of this type
 */

/**
 * @swagger
 * /networkprofiles/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new Profile
 *     tags:
 *      - NetworkProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: network Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: network Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: network Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: responsiblepeople
 *         description: People who administer this Profile
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: archive
 *         description: Is Network inactive
 *         in: formData
 *         required: true
 *         type: boolean
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
    let isarchive = false;
    if (req.body.archive === "true") isarchive = true;
    let newProfile = {
      code: { S: req.body.code },
      name: { S: req.body.name },
      description: { S: req.body.description },
      responsiblepeople: { SS: req.body.responsiblepeople },
      archive: { BOOL: isarchive },
    };
    Profiles.addNetwork(newProfile, (err, method) => {
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
 * /networkprofiles/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - NetworkProfiles
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
 * /networkprofiles/getNetworkByCode?code={code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the profile for a Network
 *     tags:
 *      - NetworkProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Networks Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getNetworkByCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const code = req.query.code;
    Profiles.getNetworkByCode(code, function (err, result) {
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
 * /networkprofiles/getNetworksByPartialNetworkName?partialnetwork={partialnetwork}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the networks that match the search criteria
 *     tags:
 *      - NetworkProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: partialnetwork
 *         description: Partial Network Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getNetworksByPartialNetworkName",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const partialnetwork = req.query.partialnetwork;
    Profiles.getNetworksByPartialNetworkName(partialnetwork, function (err, result) {
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
 * /networkprofiles/archive?profile_id={profile_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Profile
 *     tags:
 *      - NetworkProfiles
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
    Profiles.getNetworkByCode(id, function (err, scan) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      if (scan.Items.length > 0) {
        let profile = scan.Items[0];
        profile.archive = true;
        Profiles.update(profile, function (err) {
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
          msg: "Can not find item in table.",
        });
      }
    });
  }
);

/**
 * @swagger
 * /networkprofiles/update?profile_id={profile_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates a Profile
 *     tags:
 *      - NetworkProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: profile_id
 *         description: Profile's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: code
 *         description: network Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: network Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: network Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: responsiblepeople
 *         description: People who administer this Profile
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: archive
 *         description: Is Member inactive
 *         in: formData
 *         required: true
 *         type: boolean
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
    Profiles.getNetworkByCode(id, function (err, scan) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      if (scan.Items.length > 0) {
        let profile = scan.Items[0];
        profile.archive = true;
        profile.code = req.body.code;
        profile.name = req.body.name;
        profile.description = req.body.description;
        profile.responsiblepeople = req.body.responsiblepeople;
        Profiles.update(profile, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to remove: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Profile updated",
          });
        });
      } else {
        res.json({
          success: false,
          msg: "Can not find item in table.",
        });
      }
    });
  }
);

module.exports = router;
