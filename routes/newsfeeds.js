// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const DynamoDBData = DIULibrary.Methods.DynamoDBData;
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const tablename = "newsfeeds";

/**
 * @swagger
 * tags:
 *   name: NewsFeeds
 *   description: News Feed settings on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /newsfeeds/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new News Feed. Requires Hall Monitor
 *     tags:
 *      - NewsFeeds
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: destination
 *         description: URL or link to Location of News Feed source
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of News Feed
 *         in: formData
 *         required: true
 *         type: string
 *       - name: priority
 *         description: Order of Feed in display
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of News Feed Registration
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
            destination: { type: "string" },
            type: { type: "string" },
            priority: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const data = {
            destination: req.body.destination,
            type: req.body.type,
            priority: req.body.priority,
        };

        // Persist
        new AWS.DynamoDB().putItem(
            {
                TableName: tablename,
                Item: AWS.DynamoDB.Converter.marshall(data),
            },
            (err, resData) => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Failed to register: " + err,
                    });
                } else {
                    res.json({
                        success: true,
                        msg: "Registered",
                        data,
                        id: req.body.destination,
                    });
                }
            }
        );
    }
);

/**
 * @swagger
 * /newsfeeds/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates a News Feed. Requires Hall Monitor
 *     tags:
 *      - NewsFeeds
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: destination
 *         description: URL or link to Location of News Feed source
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of News Feed
 *         in: formData
 *         required: true
 *         type: string
 *       - name: priority
 *         description: Order of Feed in display
 *         in: formData
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Confirmation of update
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: Item not found to update
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
            destination: { type: "string" },
            type: { type: "string" },
            priority: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        DynamoDBData.getItemByKeys(AWS, tablename, ["destination", "type"], [req.body.destination, req.body.type], (errFind, result) => {
            if (errFind) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to update: " + errFind,
                });
            }
            if (result.Items && result.Items.length) {
                DynamoDBData.updateItem(AWS, tablename, ["destination", "type"], req.body, (err, app) => {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to update: " + err,
                        });
                    }
                    res.json({
                        success: true,
                        msg: "Updated",
                        data: req.body,
                    });
                });
            } else {
                res.status(404).json({
                    success: false,
                    msg: "Failed to find item to update",
                });
            }
        });
    }
);

/**
 * @swagger
 * /newsfeeds/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - NewsFeeds
 *     parameters:
 *       - name: destination
 *         description: News Feed's Destination
 *         in: query
 *         type: string
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
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // Declare callback
        const callback = (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send("[]");
                }
            }
        };

        // Determine method
        if (req.query.destination) {
            DynamoDBData.getItemByIndex(AWS, tablename, "destination", req.query.destination, callback);
        } else {
            DynamoDBData.getAll(AWS, tablename, callback);
        }
    }
);

/**
 * @swagger
 * /newsfeeds/delete:
 *   delete:
 *     description: Remove a newsfeed. Requires Hall Monitor
 *     security:
 *      - JWT: []
 *     tags:
 *      - NewsFeeds
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: destination
 *         description: The ID of the newsfeed being updated.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of News Feed
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of removal
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
    (req, res, next) => {
        if (req.body.destination && req.body.type) {
            const key = {
                destination: req.body.destination,
                type: req.body.type,
            };
            DynamoDBData.removeItem(AWS, tablename, key, (errRemove, result) => {
                if (errRemove) {
                    res.status(500).json({
                        success: false,
                        msg: "Error: " + errRemove,
                    });
                    return;
                }
                if (result.msg.Attributes) {
                    res.send({ success: true, msg: "Payload deleted", data: result.msg.Attributes });
                } else {
                    res.status(404).json({ success: false, msg: "Payload not found" });
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Error: No key provided",
            });
        }
    }
);

module.exports = router;
