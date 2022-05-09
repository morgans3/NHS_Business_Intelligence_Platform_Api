// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DynamoDBData = require("diu-data-functions").Methods.DynamoDBData;
const tablename = "newsfeeds";

/**
 * @swagger
 * tags:
 *   name: NewsFeeds
 *   description: News Feed settings on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /newsfeeds/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new News Feed
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
 */
router.post(
    "/register",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const newNewsFeed = {
            destination: { S: req.body.destination },
            type: { S: req.body.type },
            priority: { N: req.body.priority },
        };

        DynamoDBData.addItem(AWS, tablename, newNewsFeed, (err, install) => {
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
        });
    }
);

/**
 * @swagger
 * /newsfeeds/update:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates a News Feed
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
 */
router.post(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
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
 * /newsfeeds/getByID?destination={destination}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - NewsFeeds
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: destination
 *         description: News Feed's Destination
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
        const destination = req.query.destination;
        DynamoDBData.getItemByIndex(AWS, tablename, "destination", destination, (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
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
 * /newsfeeds/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - NewsFeeds
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
        DynamoDBData.getAll(AWS, tablename, (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
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
 * /newsfeeds/remove:
 *   delete:
 *     description: Remove a newsfeed
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
 */
router.delete(
    "/remove",
    passport.authenticate("jwt", {
        session: false,
    }),
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
