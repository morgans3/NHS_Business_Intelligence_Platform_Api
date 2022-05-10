// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const virtualward = require("../models/virtualward");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: VirtualWards
 *   description: Virtual Wards functions
 */

/**
 * @swagger
 * /virtualward/?Limit={limit}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Citizens for the Virtual Ward LTP. Requires patientidentifiabledata
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
    "/",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("patientidentifiabledata"),
    ],
    (req, res, next) => {
        const limit = req.query.Limit.toString() || "1000";
        let numCheck;
        try {
            numCheck = parseInt(limit);
        } catch {
            numCheck = 1000;
        }
        res.type("application/json");
        virtualward.getAll("virtualward_lightertouchpathway", numCheck.toString(), req.user["capabilities"], (access, err, result) => {
            if (err) {
                res.status(500).send(
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
                    res.status(404).send(
                        JSON.stringify({
                            reason: `Unable to find patients, there may not exist patients who match
                            this search.`,
                        })
                    );
                }
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
 *     description: Updates a Citizens record for the Virtual Ward LTP. Requires patientidentifiabledata
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
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("patientidentifiabledata"),
    ],
    (req, res) => {
        const item = req.body;
        virtualward.update("virtualward_lightertouchpathway", item, item.uid, function (err, data) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Item updated",
                    data: item,
                });
            }
        });
    }
);

module.exports = router;
