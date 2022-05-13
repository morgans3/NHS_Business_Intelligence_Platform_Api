// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const App = require("../models/apps");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: Application
 *   description: Applications on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /apps/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers an App. Requires Hall Monitor
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: App's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: App's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: App's icon
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
 *         description: App's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: App's url
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
 *       403:
 *        description: Forbidden due to capability requirements
 */
router.post(
    "/create",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        const newApp = {
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
                newApp["images"] = req.body.images.split(",");
            } catch (ex) {
                newApp["images"] = req.body.images;
            }
        }

        App.addApp(newApp, (err, user) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to register: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Registered",
                    data: newApp,
                });
            }
        });
    }
);

/**
 * @swagger
 * /apps/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an App. Requires Hall Monitor
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: app_name
 *         description: App's ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: App's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: App's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: App's icon
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
 *         description: App's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: App's url
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
 *       403:
 *        description: Forbidden due to capability requirements
 */
router.put(
    "/update",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res) => {
        const id = req.body.app_name;
        App.getAppByName(id, function (err, app) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            }
            const scannedItem = app.Items[0];
            scannedItem.name = req.body.name;
            scannedItem.status = req.body.status;
            scannedItem.ownerName = req.body.ownerName;
            scannedItem.ownerEmail = req.body.ownerEmail;
            scannedItem.environment = req.body.environment;
            scannedItem.icon = req.body.icon;
            scannedItem.url = req.body.url;
            scannedItem.description = req.body.description;
            if (req.body.images) scannedItem.images = req.body.images;

            App.updateApp(scannedItem, function (errUpdate, data) {
                if (errUpdate) {
                    res.status(500).json({
                        success: false,
                        msg: "Failed to update: " + errUpdate,
                    });
                }
                res.json({
                    success: true,
                    msg: "App updated",
                    data,
                });
            });
        });
    }
);

/**
 * @swagger
 * /apps/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Application
 *     parameters:
 *       - name: app_name
 *         description: App's Name
 *         in: query
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get("/", (req, res, next) => {
    // Declare callback
    const callback = (err, result) => {
        if (err) {
            res.send({ success: false, msg: err });
        } else {
            if (result.Items) {
                res.send(JSON.stringify(result.Items));
            } else {
                res.send("[]");
            }
        }
    };

    // Get by?
    if (req.query.app_name) {
        App.getAppByName(req.query.app_name, callback);
    } else {
        App.getAll(callback);
    }
});

/**
 * @swagger
 * /apps/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Deletes an App. Requires Hall Monitor
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: app_name
 *         description: App's ID
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of App being Archived
 *       403:
 *        description: Forbidden due to capability requirements
 */
router.delete(
    "/delete",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res) => {
        const id = req.query.app_name;
        App.getAppByName(id, function (err, app) {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to archive: " + err,
                });
            }
            if (app.Items && app.Items.length > 0) {
                const scannedItem = app.Items[0];
                App.removeApp(scannedItem.name, scannedItem.environment, function (errRemove, data) {
                    if (errRemove) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to update: " + errRemove,
                        });
                    }
                    res.json({
                        success: true,
                        msg: "App removed",
                    });
                });
            } else {
                res.status(404).json({
                    success: false,
                    msg: "App not found",
                });
            }
        });
    }
);

module.exports = router;
