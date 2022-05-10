// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const demographics = require("../models/demographics");
const patient = require("../models/patients");
const JWT = require("jsonwebtoken");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
/**
 * @swagger
 * tags:
 *   name: Demographics
 *   description: Demographics functions
 */

/**
 * @swagger
 * /demographics/demographicsbynhsnumber?NHSNumber={NHSNumber}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Provides validation for a NHS Number using the Date of Birth. Requires patientidentifiabledata
 *     tags:
 *      - Demographics
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
    "/demographicsbynhsnumber",
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
                demographics.getPersonByNHSNumber(nhsNumber, userroles, function (access, err, result) {
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
 * /demographics/validateNHSNumber:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Provides validation for a NHS Number using the Date of Birth. Requires patientidentifiabledata
 *     tags:
 *      - Demographics
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: Patient information to Validate.
 *           schema:
 *              type: object
 *              properties:
 *                  NHSNumber:
 *                     type: string
 *                  DateOfBirth:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       200:
 *         description: Confirmation of Task Complete
 *       400:
 *         description: Bad Request, server doesn't understand input
 *       401:
 *         description: Unauthorised
 *       409:
 *         description: Conflict with something in Database
 *       500:
 *         description: Server Error Processing Result
 */
router.post(
    "/validateNHSNumber",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("patientidentifiabledata"),
    ],
    (req, res, next) => {
        res.type("application/json");
        if (req.body && req.body.NHSNumber && req.body.DateOfBirth) {
            const NHSNumber = req.body.NHSNumber;
            const DateOfBirth = req.body.DateOfBirth;
            const jwt = req.header("authorization");
            if (jwt) {
                const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
                const userroles = decodedToken["capabilities"];
                demographics.validateNHSNumber(NHSNumber, userroles, DateOfBirth, (err, data) => {
                    if (err) {
                        res.status(400).send(
                            JSON.stringify({
                                reason: "Error: " + err,
                            })
                        );
                    } else {
                        res.status(200).json(data);
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    msg: "Incorrect format of message",
                });
            }
        } else {
            res.status(400).json({
                success: false,
                msg: "Incorrect format of message",
            });
        }
    }
);

/**
 * @swagger
 * /demographics/findMyNHSNumber:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Finds a persons NHS Number
 *     tags:
 *      - Demographics
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: Patient information to Validate.
 *           schema:
 *              type: object
 *              properties:
 *                  gender:
 *                     type: string
 *                  dob:
 *                     type: string
 *                     format: date
 *                  postcode:
 *                     type: string
 *                  forename:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Task Complete
 *       400:
 *         description: Bad Request, server doesn't understand input
 *       401:
 *         description: Unauthorised
 *       409:
 *         description: Conflict with something in Database
 *       500:
 *         description: Server Error Processing Result
 */
router.post(
    "/findMyNHSNumber",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        res.type("application/json");
        if (req.body && req.body.gender && req.body.dob && req.body.postcode) {
            const resource = {
                gender: req.body.gender,
                dob: req.body.dob,
                postcode: req.body.postcode,
            };
            if (req.body.forename) {
                resource["forename"] = req.body.forename;
            }
            patient.findMyNHSNumber(resource, (err, data) => {
                if (err) {
                    res.status(200).json({ success: true, nhsnumber: null, msg: "Unable to find NHS Number" });
                } else {
                    if (data[0] && data[0].nhs_number) res.status(200).json({ success: true, nhsnumber: data[0].nhs_number });
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Incorrect format of message",
            });
        }
    }
);

module.exports = router;
