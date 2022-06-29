// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Requests = require("../models/teamrequests");
const Members = require("../models/teammembers");
const JWT = require("jsonwebtoken");
const RoleFunctions = require("../helpers/role_functions");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: TeamRequests
 *   description: Team Requests on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /teamrequests/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a Team Request
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: Requesting User
 *         in: formData
 *         type: string
 *         required: true
 *       - name: organisation
 *         description: Requesting User's Organisation
 *         in: formData
 *         type: string
 *       - name: teamcode
 *         description: Requesting Team
 *         in: formData
 *         type: string
 *         required: true
 *       - name: requestdate
 *         description: Date of Request
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: requestor
 *         description: User requesting Access
 *         in: formData
 *         type: string
 *       - name: requestapprover
 *         description: Request Authorized/Denied By
 *         in: formData
 *         type: string
 *       - name: approveddate
 *         description: Date of Approval
 *         in: formData
 *         type: string
 *         format: date-time
 *       - name: refuseddate
 *         description: Date of Refusal (if applicable)
 *         in: formData
 *         type: string
 *         format: date-time
 *     responses:
 *       200:
 *         description: Confirmation of Request Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            username: { type: "string" },
            teamcode: { type: "string" },
            requestdate: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        Members.getteamsByMember(req.body.username, (teamRequestErr, teamRequest) => {
            // see if users is already in team
            // IF rows
            if (teamRequestErr) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to register: " + teamRequestErr,
                });
                // ELSE return message that user already exists
            } else {
                let blnInTeam = false;
                if (teamRequest) {
                    if (teamRequest.Items.length > 0) {
                        // LOOP through teams and see if req.body.teamcode exists.
                        teamRequest.Items.forEach((team) => {
                            if (team.teamcode === req.body.teamcode) {
                                blnInTeam = true;
                            }
                        });
                    }
                }
                if (blnInTeam) {
                    res.status(400).json({
                        success: false,
                        msg: "Failed to register: User is already in this team",
                    });
                } else {
                    Requests.getRequestsByTeamCodeAndUser([req.body.teamcode, req.body.username], (requestRequestErr, requestRequest) => {
                        // see if users have any open requests
                        if (requestRequestErr) {
                            res.status(500).json({
                                success: false,
                                msg: "Failed to register: " + requestRequestErr,
                            });
                            // ELSE return message that user already exists
                        } else {
                            let blnRequestMade = false;
                            if (requestRequest) {
                                // IF rows
                                if (requestRequest.Items.length > 0) {
                                    // LOOP through results and see if they have open requests
                                    requestRequest.Items.forEach((requestData) => {
                                        if (!requestData.approveddate) {
                                            blnRequestMade = true;
                                        }
                                    });
                                }
                            }
                            if (blnRequestMade) {
                                res.status(400).json({
                                    success: false,
                                    msg: "Failed to register: User already has a request to this team, please contact team administrator",
                                });
                            } else {
                                const newRequest = {
                                    username: { S: req.body.username },
                                    teamcode: { S: req.body.teamcode },
                                    requestdate: { S: req.body.requestdate },
                                };

                                if (req.body.organisation) newRequest["organisation"] = { S: req.body.organisation };
                                if (req.body.requestor) newRequest["requestor"] = { S: req.body.requestor };
                                if (req.body.requestapprover) newRequest["requestapprover"] = { S: req.body.requestapprover };
                                if (req.body.approveddate) newRequest["approveddate"] = { S: req.body.approveddate };
                                if (req.body.refuseddate) newRequest["refuseddate"] = { S: req.body.refuseddate };

                                Requests.addRequest(newRequest, (err, request) => {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            msg: "Failed to register: " + err,
                                        });
                                    } else {
                                        res.json({
                                            success: true,
                                            msg: "Registered",
                                            id: request,
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
);

/**
 * @swagger
 * /teamrequests/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an Team Request
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Request's ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: Requesting User
 *         in: formData
 *         type: string
 *         required: true
 *       - name: organisation
 *         description: Requesting User's Organisation
 *         in: formData
 *         type: string
 *       - name: teamcode
 *         description: Requesting Team
 *         in: formData
 *         type: string
 *         required: true
 *       - name: requestdate
 *         description: Date of Request
 *         in: formData
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: requestor
 *         description: User requesting Access
 *         in: formData
 *         type: string
 *       - name: requestapprover
 *         description: Request Authorized/Denied By
 *         in: formData
 *         type: string
 *       - name: approveddate
 *         description: Date of Approval
 *         in: formData
 *         type: string
 *         format: date-time
 *       - name: refuseddate
 *         description: Date of Refusal (if applicable)
 *         in: formData
 *         type: string
 *         format: date-time
 *     responses:
 *       200:
 *         description: Confirmation of Request Update
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            id: { type: "string" },
            username: { type: "string" },
            teamcode: { type: "string" },
            requestdate: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const token = req.header("authorization");
        const decodedToken = JWT.decode(token.replace("JWT ", ""));
        const username = decodedToken["username"];
        RoleFunctions.checkTeamAdmin(username, { code: req.body.teamcode }, (errCheck, resultCheck) => {
            if (errCheck) {
                res.status(500).send({ success: false, msg: errCheck });
                return;
            }
            if (!resultCheck) {
                res.status(403).send({ success: false, msg: "User not authorized to update team" });
            } else {
                const id = req.body.id;
                Requests.getRequestById(id, function (err, result) {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to update: " + err,
                        });
                    }
                    if (result.Items.length > 0) {
                        const app = result.Items[0];
                        app.username = req.body.username;
                        app.teamcode = req.body.teamcode;
                        app.requestdate = req.body.requestdate;
                        if (req.body.organisation) app.organisation = req.body.organisation;
                        if (req.body.requestor) app.requestor = req.body.requestor;
                        if (req.body.requestapprover) app.requestapprover = req.body.requestapprover;
                        if (req.body.approveddate) app.approveddate = req.body.approveddate;
                        if (req.body.refuseddate) app.refuseddate = req.body.refuseddate;

                        Requests.update(app, function (updateError) {
                            if (updateError) {
                                res.status(500).json({
                                    success: false,
                                    msg: "Failed to update: " + updateError,
                                });
                            }
                            res.json({
                                success: true,
                                msg: "Request updated",
                            });
                        });
                    } else {
                        res.status(404).json({
                            success: false,
                            msg: "Can not find item in database",
                        });
                    }
                });
            }
        });
    }
);

/**
 * @swagger
 * /teamrequests/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a Request
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Request's ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcode
 *         description: Requesting Team
 *         in: formData
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Confirmation of Request being deleted
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            id: { type: "string" },
            teamcode: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const token = req.header("authorization");
        const decodedToken = JWT.decode(token.replace("JWT ", ""));
        const username = decodedToken["username"];
        RoleFunctions.checkTeamAdmin(username, { code: req.body.teamcode }, (errCheck, resultCheck) => {
            if (errCheck) {
                res.status(500).send({ success: false, msg: errCheck });
                return;
            }
            if (!resultCheck) {
                res.status(403).send({ success: false, msg: "User not authorized to update team" });
            } else {
                const id = req.body.id;
                Requests.getRequestById(id, function (err, result) {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to delete: " + err,
                        });
                    }
                    if (result.Items.length > 0) {
                        const request = result.Items[0];
                        Requests.remove(request.id, request.teamcode, function (requestRemoveErr) {
                            if (requestRemoveErr) {
                                res.status(500).json({
                                    success: false,
                                    msg: "Failed to delete: " + requestRemoveErr,
                                });
                            }
                            res.json({
                                success: true,
                                msg: "Request deleted",
                            });
                        });
                    } else {
                        res.status(404).json({
                            success: false,
                            msg: "Can not find item in database",
                        });
                    }
                });
            }
        });
    }
);

/**
 * @swagger
 * /teamrequests/{id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Request's ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "params",
        {
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        Requests.getRequestById(req.params.id, function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items.length > 0) {
                    res.json(result.Items[0]);
                } else {
                    res.status(404).send({ success: false, msg: "Can not find item in database" });
                }
            }
        });
    }
);

/**
 * @swagger
 * /teamrequests/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamRequests
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
        Requests.getAll(function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send(JSON.stringify([]));
                }
            }
        });
    }
);

/**
 * @swagger
 * /teamrequests/username/{username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: User's Name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/username/:username",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const username = req.params.username;
        Requests.getRequestsByUsername(username, function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items.length > 0) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.status(404).json({ success: false, msg: "No requests found" });
                }
            }
        });
    }
);

/**
 * @swagger
 * /teamrequests/teamcode/{code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Team's Code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/teamcode/:code",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const code = req.params.code;
        Requests.getRequestsByTeamCode(code, function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items.length > 0) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.status(404).json({ success: false, msg: "No requests found" });
                }
            }
        });
    }
);

module.exports = router;
