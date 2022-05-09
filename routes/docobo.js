// @ts-check
const async = require("async");
const express = require("express");
const router = express.Router();
const credentials = require("../_credentials/credentials");
const Acknowledgements = require("../models/acknowledgements");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: Docobo
 *   description: Methods for Docobo to retrieve information from the ICS Data Hub
 */

/**
 * @swagger
 * /docobo/acknowledgements/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get Full List of File Upload Acknowledgements
 *     tags:
 *      - Docobo
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        description: API key
 *        schema:
 *          type: string
 *        required: true
 *     responses:
 *       200:
 *         description: Full List
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Database Error
 *       503:
 *         description: Server Unavailable
 */
router.get("/acknowledgements/", MiddlewareHelper.authenticateWithKey(credentials.docobo.inboundkey), (req, res, next) => {
    Acknowledgements.getAll(function (err, result) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (result.rows) {
                res.send(JSON.stringify(result.rows));
            } else {
                res.send("[]");
            }
        }
    });
});

/**
 * @swagger
 * /docobo/acknowledgements/report:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Submit a list of File Upload Acknowledgements
 *     tags:
 *      - Docobo
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: header
 *           name: Authorization
 *           description: API key
 *           schema:
 *             type: string
 *           required: true
 *         - in: body
 *           name: acknowledgements
 *           description: File Uploader Acknowledgements.
 *           schema:
 *                type: object
 *                properties:
 *                  importFileName:
 *                     type: string
 *                  totalPatientsInFile:
 *                     type: number
 *                  error:
 *                     type: string
 *                     nullable: true
 *                  result:
 *                     type: array
 *                     items:
 *                        type: object
 *                        properties:
 *                              rowNumber:
 *                                 type: number
 *                              nhsNumber:
 *                                 type: string
 *                              isEnrolled:
 *                                 type: boolean
 *                              error:
 *                                  type: string
 *                                  nullable: true
 *     responses:
 *       200:
 *         description: Registered all acknowledgements
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Database Error
 *       503:
 *         description: Server Unavailable
 */
router.post("/acknowledgements/report", MiddlewareHelper.authenticateWithKey(credentials.docobo.inboundkey), (req, res, next) => {
    const item = req.body;
    console.log(JSON.stringify(item));
    const newItem = {
        importFileName: item.importFileName,
        totalPatientsInFile: item.totalPatientsInFile,
        error: item.error,
        result: item.result,
    };
    if (newItem.error) {
    // Process File Error
    }
    if (newItem.result && newItem.result.length > 0) {
    // Process row acknowledgements
        newItem.result.forEach((result) => {
            result.importFileName = newItem.importFileName;
            if (result.error) {
                // Flag error
            }
        });
        let rowCount = 0;
        async.mapSeries(
            newItem.result,
            (values, outerCB) => {
                Acknowledgements.addResource(values, (err, response) => {
                    let errmsg = null;
                    if (err) {
                        errmsg = "Error in saving: " + JSON.stringify(values) + ". Error message from Database: " + err.toString();
                        console.error(errmsg);
                    } else if (response) {
                        console.log("Saved Acknowledgement for: " + values.nhsNumber);
                    }
                    rowCount++;
                    // @ts-ignore
                    outerCB(errmsg, response);
                });
            },
            (err, results) => {
                if (err) {
                    res.status(500).json({ success: false, error: err, failedOnRow: rowCount });
                } else {
                    res.json({ success: true, rowsUpdated: newItem.totalPatientsInFile });
                }
            }
        );
    } else {
        res.json({ success: true, rowsUpdated: 0 });
    }
});

module.exports = router;
