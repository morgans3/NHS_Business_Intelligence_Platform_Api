// @ts-check

const express = require("express");
const router = express.Router();
const MFA = require("../models/mfa");
const Authenticate = require("../models/authenticate");
const passport = require("passport");
const JWT = require("jsonwebtoken");
const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;
const issuer = process.env.SITE_URL || "NHS BI Platform";

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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/register",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const username = decodedToken["username"];
            if (username) {
                MFA.setup(username, (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            success: false,
                            msg: "Unable to setup MFA, reason: " + err,
                        });
                    } else {
                        res.status(200).json(response);
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: "Unable to parse request",
                });
            }
        } else {
            res.status(401).json({ status: 401, success: false, message: "User registration failed" });
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/checkmfa",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const username = decodedToken["username"];
            if (username) {
                MFA.check(username, (err, response) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ success: false, error: err });
                    } else {
                        if (response) {
                            let flag = false;
                            if (response.Items.length > 0) flag = true;
                            res.json({
                                success: true,
                                msg: flag,
                            });
                        } else {
                            res.json({
                                success: true,
                                msg: false,
                            });
                        }
                    }
                });
            }
        } else {
            res.status(401).json({ success: false, error: "User registration failed" });
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
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/verify",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.token || !req.body.tempSecret) {
            res.status(400).json({
                success: false,
                msg: "Token and Temp Secret are required",
            });
            return;
        }
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const username = decodedToken["username"];
            const email = decodedToken["email"];
            if (username && email) {
                const token = req.body.token;
                const tempSecret = req.body.tempSecret;
                MFA.verify(username, token, tempSecret, decodedToken, (err, response) => {
                    if (err) {
                        console.log(response);
                    } else {
                        EmailHelper.sendMail(
                            {
                                to: email,
                                subject: "New MFA Device Registered for: " + issuer.replace("api.", ""),
                                message: `A new device has been registered to secure your ${issuer.replace("api.", "")} \
                                account. If you are receiving this and you have not registered a new \
                                device please contact our support team immediately.`,
                            },
                            (error) => {
                                if (error) {
                                    console.log("Unable to send security email for: " + username + ". Reason: " + error.toString());
                                } else {
                                    console.log("Security email sent for new MFA device for: " + username);
                                }
                            }
                        );
                        res.json(response);
                    }
                });
            } else {
                res.status(401).json({ status: 401, message: "User verification failed" });
            }
        } else {
            res.status(401).json({ status: 401, message: "User verification failed" });
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
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/validate",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.token) {
            res.status(400).json({
                success: false,
                msg: "Token is required",
            });
            return;
        }
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const username = decodedToken["username"];
            if (username) {
                MFA.getUserSecret(username, (err, response) => {
                    if (err) {
                        res.status(404).json({ status: 404, message: "User verification method not found" });
                    } else {
                        if (response.Items.length > 0) {
                            const secret = response.Items[0].verification;
                            if (MFA.validate(secret, req.body.token)) {
                                Authenticate.upgradePassportwithOrganisation(decodedToken, true, (passportOrgError, token) => {
                                    if (passportOrgError) console.log(passportOrgError);
                                    res.json({ status: 200, message: "Authorized", token });
                                });
                            } else {
                                res.status(400).json({ status: 400, message: "User verification failed" });
                            }
                        } else {
                            res.status(404).json({ status: 404, message: "User verification method not found" });
                        }
                    }
                });
            } else {
                res.status(401).json({ status: 401, message: "User validation failed" });
            }
        } else {
            res.status(401).json({ status: 401, message: "User validation failed" });
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/unregister",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const username = decodedToken["username"];
            const email = decodedToken["email"];
            if (username && email) {
                MFA.unregister(username, (err, response) => {
                    if (err) console.log(response);
                    EmailHelper.sendMail(
                        {
                            to: email,
                            subject: "New MFA Device Unregistered for: " + issuer.replace("api.", ""),
                            message: `Your device that secures your ${issuer.replace("api.", "")} account has been \
                            unregistered. If you are receiving this and you have not unregistered your device please \
                            contact our support team immediately.`,
                        },
                        (error) => {
                            if (error) {
                                console.log(
                                    "Unable to send device removal security email for: " + username + ". Reason: " + error.toString()
                                );
                            } else {
                                console.log("Security email sent for unregistering MFA device for: " + username);
                            }
                        }
                    );
                    res.json(response);
                });
            }
        } else {
            res.status(401).json({ status: 401, message: "User authentication removal failed" });
        }
    }
);

module.exports = router;
