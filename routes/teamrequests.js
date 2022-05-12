// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Requests = require("../models/teamrequests");
const Members = require("../models/teammembers");

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
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                    if (teamRequest.Items.length) {
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
                                if (requestRequest.Items.length) {
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
                                            _id: request,
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
 * /teamrequests/update?request_id={request_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an Team Request
 *     tags:
 *      - TeamRequests
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: request_id
 *         description: Request's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: username
 *         description: Requesting User
 *         in: formData
 *         type: string
 *         required: true
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
 */
router.put(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        // TODO: check if user is allowed to update team
        const id = req.query.request_id;
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
                        msg: "Install updated",
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
 *       - name: request_id
 *         description: Request's ID
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Request being deleted
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        // TODO: check if user is allowed to update team
        const id = req.query.request_id;
        Requests.getRequestById(id, function (err, result) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to delete: " + err,
                });
            }
            if (result.Items.length > 0) {
                const request = result.Items[0];
                Requests.remove(request["_id"], request.teamcode, function (requestRemoveErr) {
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
 */
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        Requests.getRequestById(req.params.id, function (err, result) {
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
 * /teamrequests/getRequestsByUsername?username={username}:
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
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getRequestsByUsername",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const username = req.query.username;
        Requests.getRequestsByUsername(username, function (err, result) {
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
 * /teamrequests/getRequestsByTeamCode?code={code}:
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
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getRequestsByTeamCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const code = req.query.code;
        Requests.getRequestsByTeamCode(code, function (err, result) {
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

module.exports = router;
