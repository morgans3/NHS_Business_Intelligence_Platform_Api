// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Request = require("request");
const { extractInfoFromDocobo } = require("../models/docobo_process");
const credentials = require("../_credentials/credentials");
const docoboOutbound = credentials.docobo.outboundkey;
const docoboServer = credentials.docobo.server || "uk-4a-ni-uat.docobo.net";
const endpoint = "https://" + docoboServer + "/KeswickThirdPartyInterface/";
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
/**
 * @swagger
 * tags:
 *   name: DocoboOutbound
 *   description: Methods for the ICS Data Hub to  retrieve information from Docobo
 */

/**
 * @swagger
 * /docobooutbound/getpatientsbyorg:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Full List of Patients assigned to Organisation
 *     tags:
 *      - DocoboOutbound
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: orgcode
 *         description: Organisation Agreement Number
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Database Error
 *       503:
 *         description: Server Unavailable
 */
router.post(
    "/getpatientsbyorg",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (req.body.orgcode) {
            const code = req.body.orgcode;
            Request.post(
                {
                    headers: { "content-type": "application/json", Authorization: docoboOutbound },
                    url: endpoint + "WcfServices/BulkPatientExportData.svc/getpatients/" + code,
                },
                (error, response, body) => {
                    if (error) {
                        res.json({
                            success: false,
                            msg: "Error: " + error,
                        });
                    } else {
                        try {
                            res.json({
                                success: true,
                                msg: JSON.parse(body),
                            });
                        } catch (exception) {
                            res.json({
                                success: false,
                                msg: "Unable to interpret response from Docobo",
                            });
                        }
                    }
                }
            );
        } else {
            res.status(400).send("Missing Organisation Agreement Number");
        }
    }
);

/**
 * @swagger
 * /docobooutbound/getpatientdata:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Full Patient Data
 *     tags:
 *      - DocoboOutbound
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: patientid
 *         description: Docobo Patient ID
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Database Error
 *       503:
 *         description: Server Unavailable
 */
router.post(
    "/getpatientdata",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (req.body.patientid) {
            const patientid = req.body.patientid;
            Request.post(
                {
                    headers: { "content-type": "application/json", Authorization: docoboOutbound },
                    url: endpoint + "WcfServices/BulkPatientExportData.svc/getpatientdata/" + patientid,
                },
                (error, response, body) => {
                    if (error) {
                        res.json({
                            success: false,
                            msg: "Error: " + error,
                        });
                    } else {
                        try {
                            res.json({
                                success: true,
                                msg: JSON.parse(body),
                            });
                        } catch (exception) {
                            res.json({
                                success: false,
                                msg: "Unable to interpret response from Docobo",
                            });
                        }
                    }
                }
            );
        } else {
            res.status(400).send("Missing Patient ID");
        }
    }
);

/**
 * @swagger
 * /docobooutbound/processDocoboInfo:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Processes new information from Docobo and stores it in the database
 *     tags:
 *      - DocoboOutbound
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Process Completed Successfully
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Database Error
 *       503:
 *         description: Server Unavailable
 */
router.get("/processDocoboInfo", MiddlewareHelper.authenticateWithKey(credentials.docobo.inboundkey), (req, res, next) => {
    extractInfoFromDocobo((err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(result);
        }
    });
});

module.exports = router;
