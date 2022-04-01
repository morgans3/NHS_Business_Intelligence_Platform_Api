// @ts-check

const express = require("express");
const router = express.Router();
const verificationCodes = require("../models/verification_codes");
const user = require("../models/user");
const authenticate = require("../models/authenticate");
const passport = require("passport");

/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Password Functions for Nexus Intelligence Applications
 */

/**
 * @swagger
 * /password/update:
 *   post:
 *     security:
 *      - JWT: []
 *        required: false
 *     description: Updates a users password using mfa code or jwt authentication
 *     tags:
 *      - Password
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: Username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authmethod
 *         description: Authentication Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: code
 *         description: Verification Code
 *         in: formData
 *         required: false
 *         type: string
 *       - name: newpassword
 *         description: New Password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Email Sent
 */
router.post("/update", (req, res, next) => {
  //Check params
  const payload = req.body;
  if (payload && payload.username && payload.authmethod && payload.newpassword) {
    //Authenticate with jwt or authcode?
    if (payload.code) {
      verificationCodes.getCode(payload.code, (err, result) => {
        if (err) {
          console.error(err);
          res.json({
            success: false,
            msg: "Failed: " + err,
          });
          return;
        }
        if (result.Items && result.Items.length > 0) {
          if (payload.username === result.Items[0].username) {
            user.updateUser(payload.username, payload.newpassword, (updateErr, updateRes) => {
              if (updateErr) {
                console.error(updateErr);
                res.json({
                  success: false,
                  msg: "Failed: " + updateErr,
                });
                return;
              }
              verificationCodes.deleteCode(payload.code, payload.username, (delErr, delRes) => {
                if (delErr) {
                  console.error(delErr);
                  res.json({
                    success: false,
                    msg: "Failed: " + delRes,
                  });
                  return;
                }
                authenticate.authenticateDemo(updateRes, (boolErr, strToken) => {
                  if (boolErr) {
                    console.error(boolErr);
                    res.json({
                      success: false,
                      msg: "Failed: " + strToken,
                    });
                    return;
                  }
                  res.json({
                    success: true,
                    token: strToken,
                  });
                });
              });
            });
          } else {
            res.json({
              success: false,
              msg: "Use code sent to previously validated Email address",
            });
          }
        } else {
          res.json({
            success: false,
            msg: "Use code sent to previously validated Email address",
          });
        }
      });
    } else {
      //Check if user can be authenticated
      passport.authenticate("jwt", { session: false }, (err, authorisedUser) => {
        if (err || authorisedUser == false) {
          //User is not authenticated
          res.status(401).json({ success: false, msg: "Unauthenticated!" });
        } else {
          //Change user's password
          user.updateUser(authorisedUser.username, payload.newpassword, (updateErr, updateRes) => {
            if (updateErr) console.error(updateErr);
            res.json({
              success: updateErr ? false : true,
              msg: updateErr ? "Failed to update password" : "Password has been updated!",
            });
          });
        }
      })(req, res, next);
    }
  } else {
    res.status(400).json({
      success: false,
      msg: "Failed: Not provided with username and organisation",
    });
  }
});

module.exports = router;
