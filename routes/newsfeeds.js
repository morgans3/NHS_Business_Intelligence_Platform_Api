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
 *         type: number
 *     responses:
 *       200:
 *         description: Confirmation of News Feed Registration
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
        // Create item
        const newNewsFeed = {
            destination: req.body.destination,
            type: req.body.type,
            priority: req.body.priority,
        };

        // Persist
        new AWS.DynamoDB().putItem(
            {
                TableName: tablename,
                Item: AWS.DynamoDB.Converter.marshall(newNewsFeed),
            },
            (err, data) => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Failed to register: " + err,
                    });
                } else {
                    res.json({
                        success: true,
                        msg: "Registered",
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
 *   post:
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
 *         in: body
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of News Feed
 *         in: body
 *         required: true
 *         type: string
 *       - name: priority
 *         description: Order of Feed in display
 *         in: body
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Confirmation of update
 *       403:
 *        description: Forbidden due to capability requirements
 */
router.post(
    "/update",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res) => {
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
            });
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
 *         in: body
 *         required: true
 *         type: string
 *       - name: type
 *         description: Type of News Feed
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of removal
 *       403:
 *         description: Forbidden due to capability requirements
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
                destination: { S: req.body.destination },
                type: { S: req.body.type },
            };
            DynamoDBData.removeItem(AWS, tablename, key, (err, response) => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Error: " + err,
                    });
                } else {
                    res.json({
                        success: true,
                        msg: "Removed",
                    });
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
