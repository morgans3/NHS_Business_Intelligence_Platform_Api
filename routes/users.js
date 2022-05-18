// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const VerificationCodeModel = new DIULibrary.Models.VerificationCodeModel();
const Authenticate = require("../models/authenticate");
const AuthenticateHelper = require("../helpers/authenticate");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const EmailHelper = DIULibrary.Helpers.Email;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and login
 */

/**
 * @swagger
 * /users:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (req.query.organisation) {
            UserModel.getByOrgAndName(req.query, (err, result) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                } else {
                    res.send(result);
                }
            });
        } else {
            UserModel.get(req.query, (err, result) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                } else {
                    res.send(result);
                }
            });
        }
    }
);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns User Profile
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: User Profile
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/profile",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        res.json({
            user: req.user,
        });
    }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns a user by their id (username#organisation)
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: id
 *        description: Username#Organisation
 *        type: string
 *        in: path
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "params",
        {
            id: { type: "string", pattern: "[A-z. 0-9]{1,50}#[A-z. ]{1,50}" },
        },
        {
            pattern: "The user id should be in the format of 'username#organisation'",
        }
    ),
    (req, res, next) => {
        // TODO: There is an ID field and is this id compounded two other fields or using the id field?
        UserModel.getByKeys(
            {
                username: req.params.id.split("#")[0],
                organisation: req.params.id.split("#")[1],
            },
            (err, result) => {
                if (err) {
                    res.status(500).json({ success: false, msg: err.message });
                    return;
                }
                if (result.Items.length === 0) {
                    res.status(404).json({ success: false, msg: "User not found" });
                } else {
                    res.json(result.Items[0]);
                }
            }
        );
    }
);

/**
 * @swagger
 * /users/register:
 *   post:
 *     description: Registers a User. Requires Hall Monitor
 *     security:
 *      - JWT: []
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: User's name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: User's email.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: User's unique name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisation
 *         description: User's Organisation.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: linemanager
 *         description: Line Manager's Email.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/register",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.username ||
            !req.body.password ||
            !req.body.organisation ||
            !req.body.linemanager
        ) {
            res.status(400).send({ success: false, msg: "Missing params" });
            return;
        }
        const newUser = {
            name: { S: req.body.name },
            email: { S: req.body.email },
            username: { S: req.body.username },
            password: { S: req.body.password },
            organisation: { S: req.body.organisation },
            linemanager: { S: req.body.linemanager },
        };

        UserModel.addUser(newUser, req.body.password, (err, user) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to register user",
                });
            } else {
                res.json({
                    success: true,
                    msg: "User registered",
                });
            }
        });
    }
);

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     description: Authenticates a User
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: User's unique name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisation
 *         description: User's Organisation.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authentication
 *         description: User's Organisation Auth Method
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User Token
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/authenticate",
    MiddlewareHelper.validate(
        "body",
        {
            username: { type: "string" },
            password: { type: "string" },
            organisation: { type: "string" },
            authentication: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Get query parameters
        const username = req.body.username;
        const password = req.body.password;
        const organisation = req.body.organisation;
        const authentication = req.body.authentication;

        // Get JWT
        AuthenticateHelper.login(authentication, username, password, organisation, (err, user) => {
            if (err) {
                // Return error
                res.status(401).json({ success: false, msg: err });
                return null;
            } else {
                // Upgrade token
                Authenticate.upgradePassportwithOrganisation(JWT.decode(user.jwt), false, (upgradeError, token) => {
                    if (upgradeError) console.log(upgradeError);

                    // Check password expiry
                    let passwordExpired = true;

                    // Check authentication method
                    if (authentication === "Demo") {
                        // Check password expiry
                        if (user.password_expires) {
                            // Date in future?
                            if (new Date(user.password_expires).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {
                                passwordExpired = false;
                            }
                        }
                    } else {
                        // Default to false
                        passwordExpired = false;
                    }

                    // Return token
                    return res.json({ success: true, token, passwordExpired });
                });
            }
        });
    }
);

/**
 * @swagger
 * /users/validate:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Checks User Credentials
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Credentials valid
 *       401:
 *         description: Credentials invalid
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/validate",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        res.status(200).json({
            msg: "Credentials valid",
        });
    }
);

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a Nexus user. Requires Hall Monitor
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: username
 *        description: User's unique name.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: organisation
 *        description: User's Organisation.
 *        in: formData
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Credentials valid
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Credentials invalid
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/delete",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            username: { type: "string" },
            organisation: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const keys = {
            username: req.body.username,
            organisation: req.body.organisation,
        };
        UserModel.delete(keys, (err, errResult) => {
            if (err) {
                res.status(500).json({ success: false, msg: err });
                return;
            }
            if (errResult.Attributes) {
                res.send({ success: true, msg: "Payload deleted", data: errResult.Attributes });
            } else {
                res.status(404).json({ success: false, msg: "Payload not found" });
            }
        });
    }
);

/**
 * @swagger
 * /users/send-code:
 *   post:
 *     description: Send code to email address
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: email
 *         description: Email address for which to  verify
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Verification code sent
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/send-code",
    MiddlewareHelper.validate(
        "body",
        {
            email: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Generate token and send email
        const payload = req.body;
        VerificationCodeModel.create(
            {
                organisation: "",
                username: payload.email,
                generated: new Date().toISOString(),
            },
            (saveErr, savedCode) => {
                // Check for errors
                if (saveErr) {
                    res.status(500).json({ success: false, msg: "Failed: " + saveErr });
                    return;
                }

                // Send code to email
                EmailHelper.sendMail(
                    {
                        to: payload.email,
                        subject: "Verification Code for NHS BI Platform",
                        message: "Please enter this code where prompted on screen: " + savedCode.code,
                    },
                    (err, response) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ success: false, msg: "Failed: " + err });
                        } else {
                            res.json({ success: true, msg: "Code has been sent to the provided email address" });
                        }
                    }
                );
            }
        );
    }
);

/**
 * @swagger
 * /users/verify-code:
 *   post:
 *     description: Verify code sent to an email address
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: email
 *         description: Email address for which to  verify
 *         in: formData
 *         required: true
 *         type: string
 *       - name: code
 *         description: Code to use for verifying email
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Verification code is/is not valid
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Code not found
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/verify-code",
    MiddlewareHelper.validate(
        "body",
        {
            email: { type: "string" },
            code: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const payload = req.body;
        VerificationCodeModel.getCode(payload.code, payload.email, (codeErr, codeRes) => {
            if (codeErr) {
                res.status(500).json({ success: false, msg: "Failed: " + codeErr });
                return;
            }

            if (codeRes && codeRes.Items.length > 0) {
                // TODO: Dont allow re-use
                // passwordModel.deleteCode(payload.code, payload.email, () => {
                res.json({ success: true, msg: "Code is valid." });
            } else {
                res.status(404).json({ success: false, msg: "Code not valid." });
            }
        });
    }
);

module.exports = router;
