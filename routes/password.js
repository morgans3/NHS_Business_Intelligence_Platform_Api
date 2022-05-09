// @ts-check
const passport = require("passport");
const express = require("express");
const router = express.Router();

const Authenticate = require("../models/authenticate");
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
    // Check params
    const payload = req.body;
    if (payload && payload.username && payload.authmethod && payload.newpassword) {
        // Check organisation auth method
        if (payload.authmethod !== "Demo") {
            res.status(500).json({
                success: false,
                msg: "Please contact your IT Department if you wish to change your password.",
            });
            return;
        }

        // Authenticate with jwt or authcode?
        if (payload.code) {
            VerificationCodeModel.getCode(payload.code, payload.username, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({
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
                                res.status(500).json({
                                    success: false,
                                    msg: "Failed: " + updateErr,
                                });
                                return;
                            }
                            VerificationCodeModel.deleteCode(payload.code, payload.username, (delErr, delRes) => {
                                if (delErr) {
                                    console.error(delErr);
                                    res.status(500).json({
                                        success: false,
                                        msg: "Failed: " + delRes,
                                    });
                                    return;
                                }
                                Authenticate.authenticateDemo(updateRes, (boolErr, strToken) => {
                                    if (boolErr) {
                                        console.error(boolErr);
                                        res.status(500).json({
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
                    res.status(401).json({ success: false, msg: "Unauthenticated!" });
                } else {
                    // Change user's password
                    UserModel.updateUser(authorisedUser.username, payload.newpassword, (updateErr, updateRes) => {
                        if (updateErr) console.error(updateErr);
                        res.json({
                            success: !updateErr,
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
