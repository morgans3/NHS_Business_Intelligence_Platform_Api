// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const patients = require("../models/patients");
const JWT = require("jsonwebtoken");
const { sanitiseQueryLimit } = require("../helpers/routes");

/**
 * @swagger
 * tags:
 *   name: PatientLists
 *   description: Patient List functions
 */

/**
 * @swagger
 * /patientlists/?Limit={limit}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Patients
 *     tags:
 *      - PatientLists
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: Limit
 *         description: Limit of patients returned to a maximum of 5000
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Patient List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const limit = sanitiseQueryLimit(req.query.Limit);
        res.type("application/json");
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const userroles = decodedToken["capabilities"];
            patients.getAll(limit, userroles, function (access, err, result) {
                if (err) {
                    res.status(400).send(
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
                        res.status(400).send(
                            JSON.stringify({
                                reason: "Unable to find this patient, may not exist or have insufficient permissions to view record.",
                            })
                        );
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        }
    }
);

/**
 * @swagger
 * /patientlists/patientdetailsbynhsnumber?NHSNumber={NHSNumber}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Provides patient information
 *     tags:
 *      - PatientLists
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: NHSNumber
 *         description: Patient's NHS Number
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Patient Details
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/patientdetailsbynhsnumber",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                patients.getPersonByNHSNumber(nhsNumber, userroles, function (access, err, result) {
                    if (err) {
                        res.status(400).send(
                            JSON.stringify({
                                reason: "Error: " + err,
                            })
                        );
                    } else if (access) {
                        res.status(401).send(result);
                    } else {
                        if (result.length > 0) {
                            res.send(JSON.stringify(result[0]));
                        } else {
                            res.status(400).send(
                                JSON.stringify({
                                    reason: "Unable to find this patient, may not exist or have insufficient permissions to view record.",
                                })
                            );
                        }
                    }
                });
            }
        }
    }
);

/**
 * @swagger
 * /patientlists/getPatientsByCohort?limit={limit}&cohort={cohort}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Patients by Cohort
 *     tags:
 *      - PatientLists
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: limit
 *         description: Limit of patients returned to a maximum of 5000
 *         in: query
 *         type: string
 *       - name: cohort
 *         description: Cohort of patients
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Patient List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/getPatientsByCohort",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const cohort = req.query.cohort || "";
        res.type("application/json");
        const jwt = req.header("authorization");
        const limit = sanitiseQueryLimit(req.query.limit);
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const userroles = decodedToken["capabilities"];
            patients.getAllByCohort(limit, cohort, userroles, function (access, err, result) {
                if (err) {
                    res.status(400).json({
                        reason: "Error: " + err,
                    });
                } else if (access) {
                    res.status(401).send(result);
                } else {
                    if (result.length > 0) {
                        res.send(JSON.stringify(result));
                    } else {
                        res.status(400).send(
                            JSON.stringify({
                                reason: "Unable to find this patient, may not exist or have insufficient permissions to view record.",
                            })
                        );
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        }
    }
);

module.exports = router;
