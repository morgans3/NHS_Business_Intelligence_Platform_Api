// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");
const Codes = require("../models/otp_codes");
const Authenticate = require("../models/authenticate");
const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;

/**
 * @swagger
 * tags:
 *   name: MFA
 *   description: Multi Factor Authentication Methods
 */

/**
 * @swagger
 *  /otp/validate:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Validates a code
 *     tags:
 *      - OTPCodes
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: message_params
 *           description: Payload
 *           schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: string
 *     responses:
 *       200:
 *         description: Confirmation of message generation
 *       400:
 *         description: Parameters not provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error in processing
 */
router.post(
  "/validate",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const item = req.body;
    const code = item.code;
    if (code) {
      let jwt = req.header("authorization");
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      Codes.validateCode(decodedToken["email"], code, jwt, (err, response) => {
        if (err) {
          res.json({
            success: false,
            result: err,
          });
        } else {
          if (response) {
            Authenticate.upgradePassportwithOrganisation(decodedToken, true, (err, token) => {
              if (err) console.log(err);
              res.json({ status: 200, message: "Authorized", token: token });
            });
          } else {
            res.json({
              success: false,
              message: "Invalid Code",
            });
          }
        }
      });
    }
  }
);


/**
 * @swagger
 * /otp/generate:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Generate and send an OTP Code
 *     tags:
 *      - OTPCodes
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Confirmation of message generation
 *       400:
 *         description: Parameters not provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error in processing
 */
router.get(
  "/generate",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let jwt = req.header("authorization");
    let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
    const email = decodedToken["email"];

    Codes.generateCode(email, jwt, (error, code) => {
      if (error) {
        res.status(500).json({
          success: false,
          msg: "Failed, reason: " + error,
        });
      } else {
        if (email) {
          const content =
            `<p>Please use this code to access the application: ` +
            code +
            `</p>
            <p>This code will only work once and is linked directly to your account.</p>
            <p>If you have received this without requesting it please contact our support team.</p>`;
          EmailHelper.sendMail({
            to: email,
            subject: "Temporary Access code for Nexus Intelligence",
            message: content
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
                msg: "Email sent",
              });
            }
          });
        } else {
          res.status(400).json({
            success: false,
            msg: "Failed, no contact method provided",
          });
        }
      }
    });
  }
);

module.exports = router;
