// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");
const { server_authenticate, server_jwt_authenticate } = require("../config/passport-key");

const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email system for Nexus Intelligence Applications
 */

/**
 * @swagger
 * /emails/fault:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Reports a fault
 *     tags:
 *      - Email
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: message
 *         description: Message to send
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Email Sent
 */
router.post("/fault", server_authenticate, (req, res, next) => {
    const emailTo = EmailHelper.getDIUEmails();
    if (emailTo) {
        EmailHelper.sendMail({
            to: emailTo,
            message: req.body.message, 
            subject: "Fault Report"
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
        res.json({
            success: false,
            msg: "Failed: Can not find email address.",
        });
    }
});

/**
 * @swagger
 * /emails/standard:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sends a standard Message to a user
 *     tags:
 *      - Email
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: message
 *         description: Message to send
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: Person to send message to
 *         in: formData
 *         required: true
 *         type: string
 *       - name: header
 *         description: Header of Message
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Email Sent
 */
router.post(
    "/standard",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const emailTo = EmailHelper.getEmailfromUsername(req.body.username);
        if (emailTo) {
            EmailHelper.sendMail({
                to: emailTo,
                message: req.body.message,
                subject: req.body.header
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
            res.json({
                success: false,
                msg: "Failed: Can not find email address.",
            });
        }
    }
);

/**
 * @swagger
 * /emails/action:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sends a Message to a user with Actions
 *     tags:
 *      - Email
 *     consumes:
 *      - application/json
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The email details
 *        schema:
 *          type: object
 *          required:
 *            - message
 *            - email
 *            - header
 *            - actions
 *          properties:
 *            message:
 *              type: string
 *              description: Message to send
 *            email:
 *              type: string
 *              description: Receiver's email address
 *            header:
 *              type: string
 *            actions:
 *              type: array
 *              description: Email address action buttons
 *              items: 
 *                type: object
 *                properties:
 *                  class:
 *                    type: string
 *                  text:
 *                    type: string
 *                  type:
 *                    type: string
 *                  type_params:
 *                    type: object
 *     responses:
 *       200:
 *         description: Confirmation of Email Sent
 */
router.post("/action", server_jwt_authenticate, (req, res, next) => {
    EmailHelper.sendMail({
        to: req.body.email,
        message: req.body.message,
        subject: req.body.header,
        action: req.body.actions
    }, (err, response) => {
        if (err) {
            res.json({ success: false, msg: "Failed: " + err });
        } else {
            res.json({ success: true, msg: "Email sent!" });
        }
    });
});

/**
 * @swagger
 * /emails/direct:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sends a standard Message to the given email address
 *     tags:
 *      - Email
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: message
 *         description: Message to send
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: Persons email to send message to
 *         in: formData
 *         required: true
 *         type: string
 *       - name: header
 *         description: Header of Message
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Email Sent
 */
router.post(
    "/direct",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        let jwt = req.header("authorization");
        if (jwt) {
            let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const emailTo = decodedToken["email"];
            if (emailTo) {
                EmailHelper.sendMail({
                    to: emailTo,
                    message: req.body.message,
                    subject: req.body.header,
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
                res.json({
                    success: false,
                    msg: "Failed: Can not find email address.",
                });
            }
        } else {
            res.json({
                success: false,
                msg: "Failed: Can not find email address.",
            });
        }
    }
);

module.exports = router;
