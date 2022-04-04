// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Profiles = require("../models/userprofiles");
const Users = require("../models/user");
const organisations = require("../models/authenticate").organisations;
const JWT = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 *   name: UserProfiles
 *   description: Profiles of this type
 */

/**

/**
 * @swagger
 * /userprofiles/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new Profile
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: User Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: photobase64
 *         description: Photo Base64 Image
 *         in: formData
 *         type: string
 *       - name: contactnumber
 *         description: user contact number
 *         in: formData
 *         type: string
 *       - name: preferredcontactmethod
 *         description: Preferred Contact Methods
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: mobiledeviceids
 *         description: Associated Mobile Devices
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: emailpreference
 *         description: Email preference Setting
 *         in: formData
 *         type: string
 *       - name: impreference
 *         description: Instant Messaging preference Setting
 *         in: formData
 *         type: string
 *       - name: im_id
 *         description: Instant Messaging ID
 *         in: formData
 *         type: string
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
      username: { S: req.body.username },
    };
    if (req.body.preferredcontactmethod && req.body.preferredcontactmethod.length > 0) newProfile["preferredcontactmethod"] = { SS: req.body.preferredcontactmethod };
    if (req.body.mobiledeviceids && req.body.mobiledeviceids.length > 0) newProfile["mobiledeviceids"] = { SS: req.body.mobiledeviceids };
    if (req.body.photobase64) newProfile["photobase64"] = { S: req.body.photobase64 };
    if (req.body.contactnumber) newProfile["contactnumber"] = { S: req.body.contactnumber };
    if (req.body.emailpreference) newProfile["emailpreference"] = { S: req.body.emailpreference };
    if (req.body.impreference) newProfile["impreference"] = { S: req.body.impreference };
    if (req.body.im_id) newProfile["im_id"] = { S: req.body.im_id };

    Profiles.addUserProfile(newProfile, (err, method) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to register: " + err,
        });
      } else {
        res.json({
          success: true,
          msg: "Registered",
          _id: method,
        });
      }
    });
  }
);

/**
 * @swagger
 * /userprofiles/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - UserProfiles
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
 * /userprofiles/getUserProfileByUsername?username={username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the profile for a User
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: Unique Username
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getUserProfileByUsername",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const username = req.query.username;
    let org = "global";
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      if (decodedToken["authentication"] === "nwas") {
        org = decodedToken["authentication"];
      }
    }
    const requestorOrg = organisations.find((x) => x.name === org);
    Profiles.getUserProfileByUsername(username, function (err, result) {
      if (err) {
        res.send(err);
        return;
      }
      if (result.Items.length > 0) {
        Users.getUserByUsername(username, function (err2, result2) {
          if (err2) {
            res.send(err2);
          } else {
            if (result2.Items.length === 0) {
              // @ts-ignore
              requestorOrg.org.findUser(username, function (err, user) {
                if (err) {
                  return res.json({
                    success: false,
                    err: JSON.stringify(err),
                    msg: "User not found",
                  });
                }

                if (!user) {
                  // check if referral org (AD)
                  return res.json({
                    success: false,
                    msg: "User: " + username + " not found.",
                  });
                } else {
                  const orguser = {
                    _id: result.Items[0]._id,
                    name: user.cn,
                    username: user.sAMAccountName,
                    email: user.mail,
                    organisation: requestorOrg.displayname,
                    photobase64: result.Items[0].photobase64,
                    contactnumber: result.Items[0].contactnumber,
                    preferredcontactmethod: result.Items[0].preferredcontactmethod,
                    mobiledeviceids: result.Items[0].mobiledeviceids,
                    emailpreference: result.Items[0].emailpreference,
                    impreference: result.Items[0].impreference,
                    im_id: result.Items[0].im_id,
                  };
                  res.send(orguser);
                }
              });
            } else {
              let founduser = result2.Items[0];
              const fulluser = {
                _id: result.Items[0]._id,
                name: founduser.name,
                username: username,
                email: founduser.email,
                organisation: founduser.organisation,
                photobase64: result.Items[0].photobase64,
                contactnumber: result.Items[0].contactnumber,
                preferredcontactmethod: result.Items[0].preferredcontactmethod,
                mobiledeviceids: result.Items[0].mobiledeviceids,
                emailpreference: result.Items[0].emailpreference,
                linemanager: founduser.linemanager,
                impreference: result.Items[0].impreference,
                im_id: result.Items[0].im_id,
              };
              res.send(fulluser);
            }
          }
        });
      } else {
        // @ts-ignore
        requestorOrg.org.findUser(username, function (err, user) {
          if (err) {
            return res.json({
              success: false,
              err: JSON.stringify(err),
              msg: "User not found",
            });
          }

          if (!user) {
            // check if referral org (AD)
            return res.json({
              success: false,
              msg: "User: " + username + " not found.",
            });
          } else {
            const ADuser = {
              _id: user.employeeID,
              name: user.cn,
              username: user.sAMAccountName,
              email: user.mail,
              organisation: requestorOrg.displayname,
              photobase64: null,
              contactnumber: null,
              preferredcontactmethod: null,
              mobiledeviceids: null,
              emailpreference: null,
              impreference: null,
              im_id: null,
            };
            res.send(ADuser);
          }
        });
      }
    });
  }
);

/**
 * @swagger
 * /userprofiles/archive?profile_id={profile_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Profile
 *     tags:
 *      - UserProfiles
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
    Profiles.getUserProfileById(id, function (err, scan) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      if (scan.Items.length > 0) {
        let profile = scan.Items[0];
        Profiles.remove(profile, function (err) {
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
          msg: "Unable to find item in database",
        });
      }
    });
  }
);

/**
 * @swagger
 * /userprofiles/update?profile_id={profile_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates a Profile
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: profile_id
 *         description: Profile's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: username
 *         description: User Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: photobase64
 *         description: Photo Base64 Image
 *         in: formData
 *         type: string
 *       - name: contactnumber
 *         description: user contact number
 *         in: formData
 *         type: string
 *       - name: preferredcontactmethod
 *         description: Preferred Contact Methods
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: mobiledeviceids
 *         description: Associated Mobile Devices
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: emailpreference
 *         description: Email preference Setting
 *         in: formData
 *         type: string
 *       - name: impreference
 *         description: Instant Messaging preference Setting
 *         in: formData
 *         type: string
 *       - name: im_id
 *         description: Instant Messaging ID
 *         in: formData
 *         type: string
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
    Profiles.getUserProfileById(id, function (err, result) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to update: " + err,
        });
      }
      if (result.Items.length > 0) {
        var profile = result.Items[0];
        if (req.body.photobase64) profile.photobase64 = req.body.photobase64;
        if (req.body.contactnumber) profile.contactnumber = req.body.contactnumber;
        if (req.body.preferredcontactmethod) profile.preferredcontactmethod = req.body.preferredcontactmethod;
        if (req.body.mobiledeviceids) profile.mobiledeviceids = req.body.mobiledeviceids;
        if (req.body.emailpreference) profile.emailpreference = req.body.emailpreference;
        if (req.body.impreference) profile.impreference = req.body.impreference;
        if (req.body.im_id) profile.im_id = req.body.im_id;

        Profiles.updateUserProfile(profile, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to update: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Install updated",
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
