// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Request = require("request");
const jwt = require("jsonwebtoken");

const basePath = "https://10.164.36.166/mlcsu/production/gpinpatientapi/api/";

/**
 * @swagger
 * tags:
 *   name: GPInpatients
 *   description: Queries of GP Inpatients API
 */

/**
 * @swagger
 * /gpinpatients/authenticate:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Retrieves a Token for querying the GP Inpatient Methods
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: JWT Bearer Token for Querying Inpatients API
 */
router.post(
    "/authenticate",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = req.headers.authorization.replace("JWT ", "");
        const rawusername = jwt.decode(token)["username"] || "test";
        const auth = jwt.decode(token)["authentication"] || "unknown";
        const key = process.env.BTHAUTHKEY;
        if (auth === "xfyldecoast" && key) {
            const username = rawusername;
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            Request.post(
                {
                    headers: { "content-type": "application/json" },
                    url: basePath + "_Authentication/authenticate",
                    body: JSON.stringify({ username, key }),
                },
                (error, response, body) => {
                    if (error) {
                        res.status(500).json({
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
                            res.status(500).json({
                                success: false,
                                msg: "Unable to interpret response from BTH",
                            });
                        }
                    }
                }
            );
        } else {
            res.status(401).json({
                success: false,
                msg: "Not authorised to access this dataset",
            });
        }
    }
);

function sendGet(bthtoken, path, callback) {
    Request.get(
        {
            headers: { "content-type": "application/json", authorization: bthtoken },
            url: basePath + path,
        },
        (error, response, body) => {
            if (response.statusCode === 200) {
                callback(error, response, body);
            } else if (response.statusCode === 401) {
                callback(new Error("401: " + bthtoken), response, null);
            } else {
                callback(response.statusCode, response, null);
            }
        }
    );
}

/**
 * @swagger
 * /gpinpatients/inpatientcounts:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Inpatient Counts
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH Inpatient Count Totals
 */
router.post(
    "/inpatientcounts",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/InpatientCounts", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.send({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

/**
 * @swagger
 * /gpinpatients/outpatientcounts:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Outpatient Counts
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH Outpatient Count Totals
 */
router.post(
    "/outpatientcounts",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/OutpatientCounts", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.json({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

/**
 * @swagger
 * /gpinpatients/aecounts:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get AE Counts
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH AE Count Totals
 */
router.post(
    "/aecounts",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/AECounts", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.json({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

/**
 * @swagger
 * /gpinpatients/ecscounts:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get ECS Counts
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH ECS Count Totals
 */
router.post(
    "/ecscounts",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/ECSCounts", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.json({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

/**
 * @swagger
 * /gpinpatients/epccounts:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get EPC Counts
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH EPC Count Totals
 */
router.post(
    "/epccounts",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/EPCCounts", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.json({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

/**
 * @swagger
 * /gpinpatients/inpatientgpsummary:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Inpatient GP Summary
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH Inpatient GP Summary Figures
 */
router.post(
    "/inpatientgpsummary",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/InpatientsGPSummary", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.json({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

/**
 * @swagger
 * /gpinpatients/aegpsummary:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get AE GP Summary
 *     tags:
 *      - GPInpatients
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: token
 *         description: BTH Token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: BTH AE GP Summary Figures
 */
router.post(
    "/aegpsummary",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const token = "Bearer " + req.body.token;
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        sendGet(token, "FyldecoastDashboard/AEGPSummary", (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.json({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

module.exports = router;
