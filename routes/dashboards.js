// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Dashboards = require("../models/dashboards");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: Dashboards
 *   description: Dashboards on the NHS BI Platform
 */

/**
 * @swagger
 * /dashboards/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a Dashboard. Requires Hall Monitor
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: Dashboard's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: Dashboard's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: Dashboard's icon
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerName
 *         description: Owner's Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerEmail
 *         description: Owner's Email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: environment
 *         description: Dashboard's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: Dashboard's url
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: images
 *         description: List of Images
 *         in: formData
 *         type: array
 *         items:
 *           type: string
 *     responses:
 *       200:
 *         description: Confirmation of App Registration
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
            environment: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const newDashboard = {
            name: req.body.name,
            status: req.body.status,
            icon: req.body.icon,
            url: req.body.url,
            ownerName: req.body.ownerName,
            ownerEmail: req.body.ownerEmail,
            environment: req.body.environment,
            description: req.body.description,
        };
        if (req.body.images) {
            try {
                newDashboard["images"] = req.body.images.split(",");
            } catch (ex) {
                newDashboard["images"] = req.body.images;
            }
        }

        Dashboards.addDashboard(newDashboard, (err, user) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to register: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Registered",
                    data: newDashboard,
                });
            }
        });
    }
);

/**
 * @swagger
 * /dashboards/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an Dashboard. Requires Hall Monitor
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: Dashboard's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: Dashboard's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: Dashboard's icon
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerName
 *         description: Owner's Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerEmail
 *         description: Owner's Email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: environment
 *         description: Dashboard's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: Dashboard's url
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: images
 *         description: List of Images
 *         in: formData
 *         type: array
 *         items:
 *           type: string
 *     responses:
 *       200:
 *         description: Confirmation of App Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: App not found
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
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const id = req.body.name;
        Dashboards.getDashboardByName(id, function (err, app) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            }
            if (!app.Items.length) {
                res.status(404).json({
                    success: false,
                    msg: "Failed to find item",
                });
                return;
            }
            const scannedItem = app.Items[0];
            scannedItem.name = id;
            scannedItem.status = req.body.status;
            scannedItem.ownerName = req.body.ownerName;
            scannedItem.ownerEmail = req.body.ownerEmail;
            scannedItem.environment = req.body.environment;
            scannedItem.icon = req.body.icon;
            scannedItem.url = req.body.url;
            scannedItem.description = req.body.description;
            if (req.body.images) scannedItem.images = req.body.images;

            Dashboards.updateDashboard(scannedItem, function (errUpdate, data) {
                if (errUpdate) {
                    res.status(500).json({
                        success: false,
                        msg: "Failed to update: " + errUpdate,
                    });
                }
                res.json({
                    success: true,
                    msg: "Dashboard updated",
                    data: scannedItem,
                });
            });
        });
    }
);

/**
 * @swagger
 * /dashboards/:
 *   get:
 *     description: Returns the entire collection
 *     tags:
 *      - Dashboards
 *     parameters:
 *       - name: dashboard_name
 *         description: Dashboard's Name
 *         in: query
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 *       500:
 *         description: Internal Server Error
 */
router.get("/", (req, res, next) => {
    // Declare callback
    const callback = (err, result) => {
        if (err) {
            res.json({ success: false, msg: err });
        } else {
            if (result.Items) {
                res.json(result.Items);
            } else {
                res.json([]);
            }
        }
    };

    // Determine method
    if (req.query.dashboard_name) {
        Dashboards.getDashboardByName(req.query.dashboard_name, callback);
    } else {
        Dashboards.getAll(callback);
    }
});

/**
 * @swagger
 * /dashboards/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Deletes an Dashboard. Requires Hall Monitor
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: Dashboard's ID
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of App being Archived
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: App not found
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
            name: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        Dashboards.getDashboardByName(req.body.name, function (err, app) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to archive: " + err,
                });
            }
            if (app.Items && app.Items.length > 0) {
                const scannedItem = app.Items[0];
                Dashboards.removeDashboard(scannedItem.name, scannedItem.environment, function (errRemove, data) {
                    if (errRemove) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to update: " + errRemove,
                        });
                    }
                    res.json({
                        success: true,
                        msg: "Dashboard removed",
                    });
                });
            } else {
                res.status(404).json({
                    success: false,
                    msg: "Dashboard not found",
                });
            }
        });
    }
);

module.exports = router;
