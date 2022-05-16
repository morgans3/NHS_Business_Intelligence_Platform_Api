// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const DynamoDBData = DIULibrary.Methods.DynamoDBData;
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const tablename = "organisations";

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Methods for storing information on the Organisations associated with the BI Platform
 */

/**
 * @swagger
 * /organisations/:
 *   get:
 *     description: Get all Information
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: All data
 *       500:
 *         description: Internal Server Error
 */
router.get("/", (req, res, next) => {
    DynamoDBData.getAll(AWS, tablename, (err, result) => {
        if (err) {
            res.status(500).json({ success: false, msg: err });
        } else {
            res.json(result.Items);
        }
    });
});

/**
 * @swagger
 * /organisations/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new Organisation. Requires Hall Monitor
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Organisation Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authmethod
 *         description: Organisation Authentication Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: Organisation Contact
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
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
    (req, res, next) => {
        if (!req.body.code || !req.body.name || !req.body.authmethod || !req.body.contact) {
            res.status(400).json({ success: false, msg: "Bad Request" });
            return;
        }
        new AWS.DynamoDB().putItem(
            {
                TableName: tablename,
                Item: {
                    code: { S: req.body.code },
                    name: { S: req.body.name },
                    authmethod: { S: req.body.authmethod },
                    contact: { S: req.body.contact },
                },
                ReturnValues: "ALL_OLD",
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
                        id: req.body.code,
                        data,
                    });
                }
            }
        );
    }
);

/**
 * @swagger
 * /organisations/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an Organisation. Requires Hall Monitor
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Organisation Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authmethod
 *         description: Organisation Authentication Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: Organisation Contact
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of update
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
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
    (req, res) => {
        if (!req.body.code || !req.body.name || !req.body.authmethod || !req.body.contact) {
            res.status(400).json({ success: false, msg: "Bad Request" });
            return;
        }
        DynamoDBData.updateItem(AWS, tablename, ["code", "name"], req.body, (err, app) => {
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
 * /organisations/delete:
 *   delete:
 *     description: Remove an organisation. Requires Hall Monitor
 *     security:
 *      - JWT: []
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Organisation Name
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
 *        description: Forbidden due to capability requirements
 *       404:
 *         description: Not found
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
        if (req.body.code && req.body.name) {
            const key = {
                code: req.body.code,
                name: req.body.name,
            };
            DynamoDBData.getItemByKeys(AWS, tablename, ["code", "name"], [req.body.code, req.body.name], (errGet, resultGet) => {
                if (errGet) {
                    res.status(500).json({
                        success: false,
                        msg: "Failed to get: " + errGet,
                    });
                    return;
                }
                if (resultGet.Items && resultGet.Items.length === 0) {
                    res.status(404).json({
                        success: false,
                        msg: "Not found",
                    });
                    return;
                }

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
