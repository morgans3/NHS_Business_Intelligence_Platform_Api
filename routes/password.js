// @ts-check
const passport = require("passport");
const express = require("express");
const router = express.Router();
const JWT = require("jsonwebtoken");

const Authenticate = require("../models/authenticate");
const AuthenticateHelper = require("../helpers/authenticate");
const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const VerificationCodeModel = new DIULibrary.Models.VerificationCodeModel();

/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Password Functions for BI Platform Applications
 */

/**
 * @swagger
 * /password/update:
 *   put:
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
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/update", (req, res, next) => {
    // Check params
    const payload = req.body;
    if (payload && payload.username && payload.authmethod && payload.newpassword) {
        // Check organisation auth method
        if (payload.authmethod !== "Demo") {
            res.status(400).json({
                success: false,
                msg: "Please contact your IT Department if you wish to change your password.",
            });
            return;
        }

        // Authenticate with jwt or authcode?
        if (payload.code) {
            // Verify code
            VerificationCodeModel.getCode(payload.code, payload.username, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ success: false, msg: "Failed: " + err });
                    return;
                }

                // Code exists?
                if (result.Items && result.Items.length > 0) {
                    if (payload.username === result.Items[0].username) {
                        // Update user's password
                        UserModel.updateUser(payload.username, payload.newpassword, (updateErr, user) => {
                            if (updateErr) {
                                console.error(updateErr);
                                res.status(500).json({ success: false, msg: "Failed: " + updateErr });
                                return;
                            }

                            // Delete old verification code
                            VerificationCodeModel.deleteCode(payload.code, payload.username, (delErr, delRes) => {
                                if (delErr) {
                                    console.error(delErr);
                                    res.status(500).json({ success: false, msg: "Failed: " + delRes });
                                    return;
                                }

                                // Authenticate user
                                AuthenticateHelper.login(
                                    payload.authmethod,
                                    user.username,
                                    payload.newpassword,
                                    user.organisation,
                                    (loginError, authenticatedUser) => {
                                        if (loginError) {
                                            // Return error
                                            res.status(401).json({ success: false, msg: err });
                                            return null;
                                        } else {
                                            // Upgrade token
                                            Authenticate.upgradePassportwithOrganisation(
                                                JWT.decode(authenticatedUser.jwt),
                                                false,
                                                (upgradeError, token) => {
                                                    if (upgradeError) {
                                                        console.error(upgradeError);
                                                        res.status(500).json({ success: false, msg: "Failed: " + upgradeError });
                                                        return;
                                                    }

                                                    // Return token
                                                    res.json({ success: true, token });
                                                }
                                            );
                                        };
                                    });
                            });
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            msg: "Use code sent to previously validated Email address",
                        });
                    }
                } else {
                    res.status(400).json({
                        success: false,
                        msg: "Use code sent to previously validated Email address",
                    });
                }
            });
        } else {
            // Check if user can be authenticated
            passport.authenticate("jwt", { session: false }, (err, authorisedUser) => {
                if (err || authorisedUser === false) {
                    // User is not authenticated
                    res.status(401).json({ success: false, msg: "Unauthenticated" });
                } else {
                    // Change user's password
                    UserModel.updateUser(authorisedUser.username, payload.newpassword, (updateErr, updateRes) => {
                        if (updateErr) console.error(updateErr);
                        res.json({
                            success: !updateErr,
                            msg: updateErr ? "Failed to update password" : "Password has been updated",
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
