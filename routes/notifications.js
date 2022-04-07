// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Notifications = require("../models/notifications");
const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification system for Nexus Intelligence Applications
 */

/**

/**
 * @swagger
 * /notifications/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sends a Message to a user
 *     tags:
 *      - Notifications
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
 *         type: string
 *       - name: teamcode
 *         description: Team to send message to
 *         in: formData
 *         type: string
 *       - name: method
 *         description: Method of Communication
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of Notification
 *         in: formData
 *         required: true
 *         type: string
 *       - name: sentdate
 *         description: Date and Time message sent
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: acknowledgeddate
 *         description: Date and Time of Receipt
 *         in: formData
 *         type: string
 *         format: date-time
 *       - name: sender
 *         description: Username of Sender
 *         in: formData
 *         required: true
 *         type: string
 *       - name: header
 *         description: Header of Message
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link
 *         description: href link to further information
 *         in: formData
 *         type: string
 *       - name: importance
 *         description: importance of message
 *         in: formData
 *         required: true
 *         type: string
 *       - name: archive
 *         description: Archived Message Flag
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: Confirmation of Notifcation Sent
 */
router.post(
    "/register",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        var archive = false;
        if (req.body.archive.toString().toLowerCase() === "true") archive = true;
        let newNotification = {
            method: { S: req.body.method },
            type: { S: req.body.type },
            sentdate: { S: req.body.sentdate },
            sender: { S: req.body.sender },
            header: { S: req.body.header },
            importance: { S: req.body.importance },
            archive: { BOOL: archive },
        };

        if (req.body.username) newNotification["username"] = { S: req.body.username };
        if (req.body.teamcode) newNotification["teamcode"] = { S: req.body.teamcode };
        if (req.body.acknowledgeddate) newNotification["acknowledgeddate"] = { S: req.body.acknowledgeddate };
        if (req.body.message) newNotification["message"] = { S: req.body.message };
        if (req.body.link) newNotification["link"] = { S: req.body.link };

        Notifications.addNotification(newNotification, (err, notification) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to register: " + err,
                });
            } else {
                switch (req.body.method) {
                    case "Email":
                        const recipientList = EmailHelper.getEmailfromUsername(req.body.username);
                        EmailHelper.sendMail({
                            to: recipientList,
                            subject: req.body.header,
                            message: req.body.message
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
                                    _id: notification,
                                });
                            }
                        });
                        break;
                    default:
                        res.json({
                            success: true,
                            msg: "Registered",
                            _id: notification,
                        });
                        break;
                }
            }
        });
    }
);

/**
 * @swagger
 * /notifications/update?notification_id={notification_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an Installation Request
 *     tags:
 *      - Notifications
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: notification_id
 *         description: Notification's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: message
 *         description: Message to send
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: Person to send message to
 *         in: formData
 *         type: string
 *       - name: teamcode
 *         description: Team to send message to
 *         in: formData
 *         type: string
 *       - name: method
 *         description: Method of Communication
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of Notification
 *         in: formData
 *         required: true
 *         type: string
 *       - name: sentdate
 *         description: Date and Time message sent
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: acknowledgeddate
 *         description: Date and Time of Receipt
 *         in: formData
 *         type: string
 *         format: date-time
 *       - name: sender
 *         description: Username of Sender
 *         in: formData
 *         required: true
 *         type: string
 *       - name: header
 *         description: Header of Message
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link
 *         description: href link to further information
 *         in: formData
 *         type: string
 *       - name: importance
 *         description: importance of message
 *         in: formData
 *         required: true
 *         type: string
 *       - name: archive
 *         description: Archived Message Flag
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: Confirmation of Notifciation Update
 */
router.put(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        const id = req.url.replace("/update?notification_id=", "");
        Notifications.getNotificationById(id, function (err, data) {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            }
            if (data.Items.length > 0) {
                var msg = data.Items[0];
                var archive = false;
                if (req.body.archive === "true") archive = true;

                msg.method = req.body.method;
                msg.type = req.body.type;
                msg.sentdate = req.body.sentdate;
                msg.sender = req.body.sender;
                msg.header = req.body.header;
                msg.importance = req.body.importance;
                msg.archive = archive;

                if (req.body.username) msg.username = req.body.username;
                if (req.body.teamcode) msg.teamcode = req.body.teamcode;
                if (req.body.acknowledgeddate) msg.acknowledgeddate = req.body.acknowledgeddate;
                if (req.body.message) msg.message = req.body.message;
                if (req.body.link) msg.link = req.body.link;

                Notifications.update(msg, function (err) {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Failed to update: " + err,
                        });
                    }
                    res.json({
                        success: true,
                        msg: "Notifcation updated",
                    });
                });
            } else {
                res.json({
                    success: false,
                    msg: "Failed to find in database",
                });
            }
        });
    }
);

/**
 * @swagger
 * /notifications/getByID?notification_id={notification_id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Notifications
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: notification_id
 *         description: Notification's ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getByID",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const id = req.url.replace("/getByID?notification_id=", "");
        Notifications.getNotificationById(id, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

/**
 * @swagger
 * /notifications/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Notifications
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getAll",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        Notifications.getAll(function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

/**
 * @swagger
 * /notifications/getNotificationsByUsername?username={username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Notifications
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: User's Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getNotificationsByUsername",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const username = req.url.replace("/getNotificationsByUsername?username=", "");
        Notifications.getNotificationsByUsername(username, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

/**
 * @swagger
 * /notifications/getNotificationsByTeamCode?code={code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Notifications
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Team's Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getNotificationsByTeamCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const code = req.url.replace("/getNotificationsByTeamCode?code=", "");
        Notifications.getNotificationsByTeamCode(code, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

module.exports = router;
