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
 * /teamrequests/register:
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
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    Members.getteamsByMember(req.body.username, (teamRequestErr, teamRequest) => {
      //see if users is already in team
      // IF rows
      if (teamRequestErr) {
        res.json({
          success: false,
          msg: "Failed to register: " + teamRequestErr,
        });
        // ELSE return message that user already exists
      } else {
        let blnInTeam = false;
        if (teamRequest) {
          if (teamRequest.Items.length) {
            //LOOP through teams and see if req.body.teamcode exists.
            teamRequest.Items.forEach((team) => {
              if (team.teamcode == req.body.teamcode) {
                blnInTeam = true;
              }
            });
          }
        }
        if (blnInTeam) {
          res.json({
            success: false,
            msg: "Failed to register: User is already in this team",
          });
        } else {
          Requests.getRequestsByTeamCodeAndUser([req.body.teamcode, req.body.username], (requestRequestErr, requestRequest) => {
            //see if users have any open requests
            if (requestRequestErr) {
              res.json({
                success: false,
                msg: "Failed to register: " + requestRequestErr,
              });
              // ELSE return message that user already exists
            } else {
              let blnRequestMade = false;
              if (requestRequest) {
                //IF rows
                if (requestRequest.Items.length) {
                  //LOOP through results and see if they have open requests
                  requestRequest.Items.forEach((requestData) => {
                    if (!requestData.approveddate) {
                      blnRequestMade = true;
                    }
                  });
                }
              }
              if (blnRequestMade) {
                res.json({
                  success: false,
                  msg: "Failed to register: User already has a request to this team, please contact team administrator",
                });
              } else {
                let newRequest = {
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
    const id = req.query.request_id;
    Requests.getRequestById(id, function (err, result) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to update: " + err,
        });
      }
      if (result.Items.length > 0) {
        var app = result.Items[0];
        app.username = req.body.username;
        app.teamcode = req.body.teamcode;
        app.requestdate = req.body.requestdate;
        if (req.body.requestor) app.requestor = req.body.requestor;
        if (req.body.requestapprover) app.requestapprover = req.body.requestapprover;
        if (req.body.approveddate) app.approveddate = req.body.approveddate;
        if (req.body.refuseddate) app.refuseddate = req.body.refuseddate;

        Requests.update(app, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to update: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Install updated",
          });
        });
      } else {
        res.json({
          success: false,
          msg: "Can not find item in database",
        });
      }
    });
  }
);

/**
 * @swagger
 * /teamrequests/archive?request_id={request_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Archives a Request
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
 *     responses:
 *       200:
 *         description: Confirmation of Request being Archived
 */
router.put(
  "/archive",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.request_id;
    Requests.getRequestById(id, function (err, result) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      if (result.Items.length > 0) {
        var request = result.Items[0];
        Requests.remove(request._id, request.teamcode, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to archive: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Request archived",
          });
        });
      } else {
        res.json({
          success: false,
          msg: "Can not find item in database",
        });
      }
    });
  }
);

/**
 * @swagger
 * /teamrequests/getByID?request_id={request_id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
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
    const id = req.query.request_id;
    Requests.getRequestById(id, function (err, result) {
      if (err) {
        res.send(err);
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
 * /teamrequests/getAll:
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
  "/getAll",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    Requests.getAll(function (err, result) {
      if (err) {
        res.send(err);
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
        res.send(err);
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
        res.send(err);
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
 * /teamrequests/getOutstandingRequests:
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
  "/getOutstandingRequests",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    Requests.getOutstandingRequests(function (err, result) {
      if (err) {
        res.send(err);
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
