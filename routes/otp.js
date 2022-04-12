// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");
const Codes = require("../models/otp_codes");
const Authenticate = require("../models/authenticate");

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
 *      - MFA
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

module.exports = router;
