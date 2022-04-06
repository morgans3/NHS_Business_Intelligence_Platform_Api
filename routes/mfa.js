// @ts-check

const express = require("express");
const router = express.Router();
const MFA = require("../models/mfa");
const Authenticate = require("../models/authenticate");
const passport = require("passport");
const JWT = require("jsonwebtoken");
const Request = require("request");

/**
 * @swagger
 * tags:
 *   name: MFA
 *   description: Multi Factor Authentication Methods
 */

/**
 * @swagger
 * /mfa/register:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Registers a User Authentication Method
 *     tags:
 *      - MFA
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Confirmation of Authentication Setup
 */
router.get(
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      let username = decodedToken["username"];
      if (username) {
        MFA.setup(username, (err, response) => {
          if (err) console.log(response);
          res.json(response);
        });
      }
    } else {
      res.json({ status: 401, message: "User registration failed" });
    }
  }
);

/**
 * @swagger
 * /mfa/checkmfa:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Checks if a user has registered a User Authentication Method
 *     tags:
 *      - MFA
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Confirmation of Authentication Setup
 */
router.get(
  "/checkmfa",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      let username = decodedToken["username"];
      if (username) {
        MFA.check(username, (err, response) => {
          if (err) {
            console.log(err);
            res.json({ status: 200, error: err });
          } else {
            if (response) {
              let flag = false;
              if (response.Items.length > 0) flag = true;
              res.json({
                status: 200,
                msg: flag,
              });
            }
          }
        });
      }
    } else {
      res.json({ status: 401, error: "User registration failed" });
    }
  }
);

/**
 * @swagger
 * /mfa/verify:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Verifies User Authentication Method
 *     tags:
 *      - MFA
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: Generated Token.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: tempSecret
 *         description: Temporary Secret
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Authentication Setup
 */
router.post(
  "/verify",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      let username = decodedToken["username"];
      let email = decodedToken["email"];
      if (username && email) {
        let token = req.body.token;
        let tempSecret = req.body.tempSecret;
        MFA.verify(username, token, tempSecret, decodedToken, (err, response) => {
          if (err) {
            console.log(response);
          } else {
            const options = {
              headers: {
                authorization: jwt,
              },
              url: "https://messaging.nexusintelligencenw.nhs.uk/emails/direct",
              form: {
                message: "A new device has been registered to secure your Nexus Intelligence account. If you are receiving this and you have not registered a new device please contact our support team immediately.",
                email: email,
                header: "New MFA Device Registered for Nexus Intelligence",
              },
            };
            Request.post(options, (error, response, body) => {
              if (error) {
                console.log("Unable to send security email for: " + username + ". Reason: " + error.toString());
              } else {
                console.log("Security email sent for new MFA device for: " + username);
              }
            });
            res.json(response);
          }
        });
      } else {
        res.json({ status: 401, message: "User verification failed" });
      }
    } else {
      res.json({ status: 401, message: "User verification failed" });
    }
  }
);

/**
 * @swagger
 * /mfa/validate:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Validates the User Authentication Method
 *     tags:
 *      - MFA
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: Generated Token.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Authentication Setup
 */
router.post(
  "/validate",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      let username = decodedToken["username"];
      if (username) {
        MFA.getUserSecret(username, (err, response) => {
          if (err) {
            res.json({ status: 404, message: "User verification method not found" });
          } else {
            if (response.Items.length > 0) {
              const secret = response.Items[0].verification;
              if (MFA.validate(secret, req.body.token)) {
                Authenticate.upgradePassportwithOrganisation(decodedToken, true, (err, token) => {
                  if (err) console.log(err);
                  res.json({ status: 200, message: "Authorized", token: token });
                });
              } else {
                res.json({ status: 400, message: "User verification failed" });
              }
            } else {
              res.json({ status: 404, message: "User verification method not found" });
            }
          }
        });
      } else {
        res.json({ status: 401, message: "User validation failed" });
      }
    } else {
      res.json({ status: 401, message: "User validation failed" });
    }
  }
);

/**
 * @swagger
 * /mfa/unregister:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Unregisters a User Authentication Method
 *     tags:
 *      - MFA
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Confirmation of Authentication Removal
 */
router.get(
  "/unregister",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      let username = decodedToken["username"];
      let email = decodedToken["email"];
      if (username && email) {
        MFA.unregister(username, (err, response) => {
          if (err) console.log(response);
          const options = {
            headers: {
              authorization: jwt,
            },
            url: "https://messaging.nexusintelligencenw.nhs.uk/emails/direct",
            form: {
              message: "Your device that secures your Nexus Intelligence account has been unregistered. If you are receiving this and you have not unregistered your device please contact our support team immediately.",
              email: email,
              header: "MFA Device Unregistered for Nexus Intelligence",
            },
          };
          Request.post(options, (error, response, body) => {
            if (error) {
              console.log("Unable to send device removal security email for: " + username + ". Reason: " + error.toString());
            } else {
              console.log("Security email sent for unregistering MFA device for: " + username);
            }
          });
          res.json(response);
        });
      }
    } else {
      res.json({ status: 401, message: "User authentication removal failed" });
    }
  }
);

module.exports = router;
