// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const SystemAlerts = require("../models/systemalerts");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: SystemAlerts
 *   description: System Alerts for Nexus Intelligence Applications
 */

/**
 * @swagger
 * /systemalerts/:
 *   get:
 *     description: Returns the entire collection
 *     tags:
 *      - SystemAlerts
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
router.get("/", (req, res, next) => {
    SystemAlerts.getAll(function (err, result) {
        if (err) {
            res.status(500).send({ success: false, msg: err });
        } else {
            if (result.Items) {
                res.send(JSON.stringify(result.Items));
            } else {
                res.send(JSON.stringify("[]"));
            }
        }
    });
});

/**
 * @swagger
 * /systemalerts/getActive:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SystemAlerts
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
    "/getActive",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        SystemAlerts.getActiveSystemAlerts(new Date(), function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send(JSON.stringify("[]"));
                }
            }
        });
    }
);

/**
 * @swagger
 * /systemalerts/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates a System Alert. Requires Hall Monitor
 *     tags:
 *      - SystemAlerts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Alerts's ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Alert Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: message
 *         description: Alert Message
 *         in: formData
 *         required: true
 *         type: string
 *       - name: startdate
 *         description: Start Date and Time
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: enddate
 *         description: End Date and Time
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: status
 *         description: Alert Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: Icon
 *         in: formData
 *         required: true
 *         type: string
 *       - name: author
 *         description: User who created the alert
 *         in: formData
 *         type: string
 *         required: true
 *       - name: archive
 *         description: Archive Flag
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: Confirmation of Alert Update
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.put(
    "/update",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            name: { type: "string" },
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const newAlert = {
            id: req.body.id,
            name: req.body.name,
            message: req.body.message,
            startdate: req.body.startdate,
            enddate: req.body.enddate,
            status: req.body.status,
            icon: req.body.icon,
            author: req.body.author,
            archive: req.body.archive,
        };
        SystemAlerts.updateSystemAlert(newAlert, function (err) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            }
            res.json({
                success: true,
                msg: "Alert updated",
                data: newAlert,
            });
        });
    }
);

/**
 * @swagger
 * /systemalerts/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sets up a System Alert. Requires Hall Monitor
 *     tags:
 *      - SystemAlerts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: Alert Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: message
 *         description: Alert Message
 *         in: formData
 *         required: true
 *         type: string
 *       - name: startdate
 *         description: Start Date and Time
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: enddate
 *         description: End Date and Time
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: status
 *         description: Alert Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: Icon
 *         in: formData
 *         required: true
 *         type: string
 *       - name: author
 *         description: User who created the alert
 *         in: formData
 *         type: string
 *         required: true
 *       - name: archive
 *         description: Archive Flag
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: Confirmation of Alert Update
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/create",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            name: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const newSystemAlerts = {
            name: { S: req.body.name },
            message: { S: req.body.message },
            startdate: { S: req.body.startdate },
            enddate: { S: req.body.enddate },
            status: { S: req.body.status },
            icon: { S: req.body.icon },
            author: { S: req.body.author },
            archive: { BOOL: false },
        };

        SystemAlerts.addSystemAlert(newSystemAlerts, (err, event) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to register: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Registered",
                    id: event,
                });
            }
        });
    }
);

module.exports = router;
