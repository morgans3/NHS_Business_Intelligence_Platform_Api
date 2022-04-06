// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const virtualward = require("../models/virtualward");
const JWT = require("jsonwebtoken");
const govukreceipt = require("../models/govukreceipt");
const { server_authenticate } = require("../config/passport-key");

/**
 * @swagger
 * tags:
 *   name: VirtualWards
 *   description: Virtual Wards functions
 */

/**
 * @swagger
 * /virtualward/getAll?Limit={limit}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Citizens
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: Limit
 *         description: Limit of patients returned
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/getAll",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        let limit = req.query.Limit.toString() || "1000";
        try {
            const numCheck = parseInt(limit);
        } catch {
            limit = "1000";
        }
        res.type("application/json");
        let jwt = req.header("authorization");
        if (jwt) {
            let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const userroles = decodedToken["roles"];
            virtualward.getAll("virtualward_lightertouchpathway", limit, userroles, function (access, err, result) {
                if (err) {
                    res.status(400).send(
                        JSON.stringify({
                            reason: "Error: " + err,
                        })
                    );
                } else if (access) {
                    res.status(401).send(result);
                } else {
                    if (result.length > 0) {
                        res.send(JSON.stringify(result));
                    } else {
                        res.status(400).send(
                            JSON.stringify({
                                reason: "Unable to find patients, there may not exist patients who match this search or you may have insufficient permissions to view record.",
                            })
                        );
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        }
    }
);

/**
 * @swagger
 * /virtualward/sendManualMessage:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Citizens
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: params
 *           description: Covid Result Payload
 *           schema:
 *                type: object
 *                properties:
 *                  phone:
 *                     type: string
 *                  uid:
 *                    type: string
 *                  nhs_number:
 *                    type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.post(
    "/sendManualMessage",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        let jwt = req.header("authorization");
        let params = req.body;
        if (jwt && params) {
            let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const username = decodedToken["username"];
            const organisation = decodedToken["organisation"];
            virtualward.manuallySendMessage(params.phone, params.uid, (err, result) => {
                if (err) {
                    res.status(400).send(JSON.stringify(result));
                } else {
                    const item = {
                        nhs_number: params.nhs_number,
                        contact: params.phone,
                        messageid: result.msg,
                    };
                    virtualward.registerManualLog(item, username, organisation, (error, result2) => {
                        if (error) {
                            console.error("Error: " + error);
                            res.status(400).json({ success: false, msg: "Error: " + error });
                        } else {
                            res.json({ success: true, msg: "Message Sent" });
                        }
                    });
                }
            });
        } else {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        }
    }
);

/**
 * @swagger
 * /virtualward/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new item
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: nhs_number
 *         description: NHS Number
 *         in: formData
 *         required: true
 *         type: string
 *       - name: demographics
 *         description: Patient info
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: Contact phone number
 *         in: formData
 *         type: string
 *         required: true
 *       - name: specimen_date
 *         description: Specimen date
 *         in: formData
 *         required: true
 *         type: string
 *       - name: messagesent
 *         description: Date time of message being sent
 *         in: formData
 *         required: true
 *         type: string
 *       - name: messageid
 *         description: Gov UK Message ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: LTP status
 *         in: formData
 *         type: string
 *       - name: ccg_code
 *         description: CCG Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: gpp_code
 *         description: GP Practice Code
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Item Saved
 */
router.post(
    "/register",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        let newItem = req.body;
        virtualward.registerLTPRecord(newItem, (err, notification) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to register: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Registered",
                });
            }
        });
    }
);

/**
 * @swagger
 * /virtualward/update:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates an Installation Request
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Unique ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: nhs_number
 *         description: NHS Number
 *         in: formData
 *         required: true
 *         type: string
 *       - name: demographics
 *         description: Patient info
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: Contact phone number
 *         in: formData
 *         type: string
 *         required: true
 *       - name: specimen_date
 *         description: Specimen date
 *         in: formData
 *         required: true
 *         type: string
 *       - name: messagesent
 *         description: Confirmation of message being sent
 *         in: formData
 *         required: true
 *         type: boolean
 *       - name: messageid
 *         description: Gov UK Message ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: LTP status
 *         in: formData
 *         type: string
 *       - name: ccg_code
 *         description: CCG Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: gpp_code
 *         description: GP Practice Code
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Notifciation Update
 */
router.post(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        let item = req.body;
        virtualward.update("virtualward_lightertouchpathway", item, item.uid, function (err, data) {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Item updated",
                });
            }
        });
    }
);

/**
 * @swagger
 * /virtualward/getByID?uid={uid}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Item's ID
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
        const uid = req.query.uid;
        virtualward.getLTPCitizenFromID(uid, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                if (result) {
                    res.send(JSON.stringify(result));
                } else {
                    res.status(400).send(null);
                }
            }
        });
    }
);

/**
 * @swagger
 * /virtualward/getScriptLog:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of logs from the Automated Script
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/getScriptLog",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        res.type("application/json");
        virtualward.getAllScripts(function (err, result) {
            if (err) {
                res.status(400).send(
                    JSON.stringify({
                        reason: "Error: " + err,
                    })
                );
            } else {
                res.send(JSON.stringify(result));
            }
        });
    }
);

/**
 * @swagger
 * /virtualward/getManualLogs:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of logs from the Manual entries
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/getManualLogs",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        res.type("application/json");
        virtualward.getAllManualLogs(function (err, result) {
            if (err) {
                res.status(400).send(
                    JSON.stringify({
                        reason: "Error: " + err,
                    })
                );
            } else {
                res.send(JSON.stringify(result));
            }
        });
    }
);

/**
 * @swagger
 * /virtualward/triggerAutomatedScript:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Triggers automated script to send out SMS messages
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get("/triggerAutomatedScript", server_authenticate, (req, res, next) => {
    res.type("application/json");
    // 1. check for new PHE Data since script last ran
    // virtualward.checkNewData((err, result) => {
    //   if (err) {
    //     res.status(400).send(JSON.stringify({ reason: "Error: " + err }));
    //     return;
    //   }

    //   if (result) {
    // 2. get New List of citizens who match criteria
    virtualward.getNewList((listErr, listResult) => {
        if (listErr) {
            res.status(400).send(JSON.stringify({ reason: "Error: " + listErr }));
            return;
        }
        if (listResult && listResult.length > 0) {
            // 3. sendMessagesToCitizens
            virtualward.sendMessagesToCitizens(listResult, (msgErr, msgResult) => {
                if (msgErr) {
                    res.status(400).send(JSON.stringify({ reason: "Error: " + msgErr }));
                    return;
                }
                virtualward.completeScript("All messages processed.", listResult.length.toString(), (compErr, compRes) => {
                    if (compErr) {
                        res.status(400).send(JSON.stringify({ reason: "Error: " + compErr }));
                        return;
                    }
                    res.status(200).json({ success: true, msg: "Completed sending outstanding messages." });
                });
            });
        } else {
            virtualward.completeScript("No new results to process.", "0", (compErr, compRes) => {
                if (compErr) {
                    res.status(400).send(JSON.stringify({ reason: "Error: " + compErr }));
                    return;
                }
                res.status(200).json({ success: true, msg: "No new results to process." });
            });
        }
    });
    //   } else {
    //     virtualward.completeScript("No new results to process.", "0", (compErr, compRes) => {
    //       if (compErr) {
    //         res.status(400).send(JSON.stringify({ reason: "Error: " + compErr }));
    //         return;
    //       }
    //       res.status(200).json({ success: true, msg: "No new results to process." });
    //     });
    //   }
    // });
});

/**
 * @swagger
 * /virtualward/getAllServiceCountLogs:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of logs from the Notify Receipts
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/getAllServiceCountLogs",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        res.type("application/json");
        govukreceipt.getAllServiceCountLogs(function (err, result) {
            if (err) {
                res.status(400).send(
                    JSON.stringify({
                        reason: "Error: " + err,
                    })
                );
            } else {
                res.send(JSON.stringify(result));
            }
        });
    }
);

module.exports = router;
