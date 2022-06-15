// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const history = require("../models/patienthistory");
const JWT = require("jsonwebtoken");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: PatientHistory
 *   description: Patient History functions
 */

/**
 * @swagger
 * /patienthistory/patienthistorybynhsnumber:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Provides patient history. Requires patientidentifiabledata
 *     tags:
 *      - PatientHistory
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: NHSNumber
 *         description: Patient's NHS Number
 *         in: query
 *         required: true
 *         type: string
 *         example: "0123456789"
 *     responses:
 *       200:
 *         description: Patient Details
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/patienthistorybynhsnumber",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("patientidentifiabledata"),
    ],
    (req, res, next) => {
        const nhsNumber = req.query.NHSNumber;
        res.type("application/json");
        if (nhsNumber === undefined || nhsNumber === null) {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        } else {
            const jwt = req.header("authorization");
            if (jwt) {
                const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
                const userroles = decodedToken["capabilities"];
                history.getPersonsPopulationHistoryByNHSNumber(nhsNumber, userroles, function (access, err, result) {
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
                            res.send(JSON.stringify([]));
                        }
                    }
                });
            }
        }
    }
);

/**
 * @swagger
 * /patienthistory/districthistorybynhsnumber:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Provides citizen's district record history. Requires patientidentifiabledata
 *     tags:
 *      - PatientHistory
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: NHSNumber
 *         description: Patient's NHS Number
 *         in: query
 *         required: true
 *         type: string
 *         example: "0123456789"
 *     responses:
 *       200:
 *         description: Patient Details
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/districthistorybynhsnumber",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("patientidentifiabledata"),
    ],
    (req, res, next) => {
        const nhsNumber = req.query.NHSNumber;
        res.type("application/json");
        if (nhsNumber === undefined || nhsNumber === null) {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        } else {
            const jwt = req.header("authorization");
            if (jwt) {
                const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
                const userroles = decodedToken["capabilities"];
                history.getPersonsDistrictHistoryByNHSNumber(nhsNumber, userroles, function (access, err, result) {
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
                            res.send(JSON.stringify([]));
                        }
                    }
                });
            }
        }
    }
);

module.exports = router;
