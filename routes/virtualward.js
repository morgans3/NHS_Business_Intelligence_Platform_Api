// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const virtualward = require("../models/virtualward");
const JWT = require("jsonwebtoken");
const govukreceipt = require("../models/govukreceipt");

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
