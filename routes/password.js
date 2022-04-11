// @ts-check
const passport = require("passport");
const express = require("express");
const router = express.Router();

const AWS = require("../config/database").AWS;
const Authenticate = require("../models/authenticate");
const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel(AWS);
const VerificationCodeModel = new DIULibrary.Models.VerificationCodeModel(AWS);
const EmailHelper = DIULibrary.Helpers.Email;

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
    //Check organisation auth method
    if (payload.authmethod !== "Demo") {
      res.json({
        success: false,
        msg: "Please contact your IT Department if you wish to change your password.",
      });
      return;
    }

    //Authenticate with jwt or authcode?
    if (payload.code) {
      VerificationCodeModel.getCode(payload.code, payload.username, (err, result) => {
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
            UserModel.updateUser(payload.username, payload.newpassword, (updateErr, updateRes) => {
              if (updateErr) {
                console.error(updateErr);
                res.json({
                  success: false,
                  msg: "Failed: " + updateErr,
                });
                return;
              }
              VerificationCodeModel.deleteCode(payload.code, payload.username, (delErr, delRes) => {
                if (delErr) {
                  console.error(delErr);
                  res.json({
                    success: false,
                    msg: "Failed: " + delRes,
                  });
                  return;
                }
                Authenticate.authenticateDemo(updateRes, (boolErr, strToken) => {
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
          UserModel.updateUser(authorisedUser.username, payload.newpassword, (updateErr, updateRes) => {
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


/**
 * @swagger
 * /password/generate:
 *   post:
 *     description: Generates a verification code  (To be replaced by /users/send-code)
 *     tags:
 *      - Email
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
 *     responses:
 *       200:
 *         description: Confirmation of Email Sent
 */
router.post("/generate", (req, res, next) => {
  const payload = req.body;
  if (payload && payload.username && payload.authmethod) {
    if (payload.authmethod !== "Demo") {
      res.json({
        success: false,
        msg: "Please contact your IT Department if you wish to change your password.",
      });
      return;
    }

    UserModel.getUserByUsername(payload.username, (err, result) => {
      if (err) {
        console.log(err);
        res.json({
          success: false,
          msg: "Failed: " + err,
        });
        return;
      }
      if (result.Items && result.Items.length > 0) {
        VerificationCodeModel.create({
          username: payload.username,
          organisation: "Collaborative Partners",
          generated: new Date().toISOString(),
        }, (saveErr, saveRes) => {
          if (saveErr) {
            console.log(saveErr);
            res.json({
              success: false,
              msg: "Failed: " + saveErr,
            });
            return;
          }

          EmailHelper.sendMail({
            to: payload.username,
            subject: "Verification Code for Nexus Intelligence",
            message: "Please enter this code where prompted on screen: " + saveRes.code
          }, (err, response) => {
            if (err) {
              console.log(err);
              res.json({
                success: false,
                msg: "Failed: " + err,
              });
            } else {
              res.json({
                success: true,
                msg: "Code has been sent to previously validated Email address",
              });
            }
          });
        });
      } else {
        res.json({
          success: true,
          msg: "Code has been sent to previously validated Email address",
        });
      }
    });
  } else {
    res.status(400).json({
      success: false,
      msg: "Failed: Not provided with username and organisation",
    });
  }
});

/**
 * @swagger
 * /password/verify:
 *   post:
 *     description: Checks a verification code (To be replaced by /users/verify-code)
 *     tags:
 *      - Email
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Verification Code
 *         in: formData
 *         required: true
 *         type: string
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
 *     responses:
 *       200:
 *         description: Confirmation code exists
 */
router.post("/verify", (req, res, next) => {
  const payload = req.body;
  if (payload && payload.username && payload.authmethod && payload.code) {
    if (payload.authmethod !== "Demo") {
      res.json({
        success: false,
        msg: "Please contact your IT Department if you wish to change your password.",
      });
      return;
    }
    VerificationCodeModel.getCode(payload.code, payload.username, (codeErr, codeRes) => {
      if (codeErr) {
        console.log(codeErr);
        res.json({
          success: false,
          msg: "Failed: " + codeErr,
        });
        return;
      }
      if (codeRes && codeRes.Items.length > 0) {
        res.json({
          success: true,
          msg: "Code has been validated",
        });
      } else {
        res.json({
          success: false,
          msg: "Code not valid.",
        });
      }
    });
  } else {
    res.status(400).json({
      success: false,
      msg: "Failed: Not provided with username, code and organisation",
    });
  }
});

module.exports = router;
