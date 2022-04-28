// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const virtualward_decision = require("../models/virtualward_decision");
const JWT = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 *   name: VirtualWards
 *   description: Virtual Wards functions
 */

/**
 * @swagger
 * /virtualward_decision/getAll?Limit={limit}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Patients
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: Limit
 *         description: Limit of patients returned
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
  "/getAll",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let limit = req.query.Limit.toString() || "1000";
    try {
      const numCheck = parseInt(limit);
    } catch {
      limit = "1000";
    }
    res.type("application/json");
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      const userroles = decodedToken["capabilities"];
      virtualward_decision.getAll(limit, userroles, function (access, err, result) {
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
 * /virtualward_decision/getAllByStatus:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Patients by status
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: information to query.
 *           schema:
 *              type: object
 *              properties:
 *                  status:
 *                     type: string
 *                  limit:
 *                     type: string
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
router.post(
  "/getAllByStatus",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let status = req.body.status;
    let limit = req.body.limit.toString() || "1000";
    try {
      const numCheck = parseInt(limit);
    } catch {
      limit = "1000";
    }
    res.type("application/json");
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      const userroles = decodedToken["capabilities"];
      virtualward_decision.getAllByStatus(status, userroles, limit, function (access, err, result) {
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
 * /virtualward_decision/updateStatus:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates the Status
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: information to update.
 *           schema:
 *              type: object
 *              properties:
 *                  id:
 *                     type: string
 *                  status:
 *                     type: string
 *                  nonreferral_reason:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Task Updated
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
  "/updateStatus",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.type("application/json");
    if (req.body && req.body.status && req.body.id) {
      const id = req.body.id;
      const status = req.body.status;
      const nonreferral_reason = req.body.nonreferral_reason || null;
      virtualward_decision.updateStatus(id, status, nonreferral_reason, (err, data) => {
        if (err) {
          res.status(400).send(
            JSON.stringify({
              reason: "Error: " + err,
            })
          );
        } else {
          res.status(200).json({ success: true });
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

/**
 * @swagger
 * /virtualward_decision/getAllActioned?Limit={limit}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of Patients
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: Limit
 *         description: Limit of patients returned
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
  "/getAllActioned",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let limit = req.query.Limit.toString() || "1000";
    try {
      const numCheck = parseInt(limit);
    } catch {
      limit = "1000";
    }
    res.type("application/json");
    let jwt = req.header("authorization");
    if (jwt) {
      let decodedToken = JWT.decode(jwt.replace("JWT ", ""));
      const userroles = decodedToken["capabilities"];
      virtualward_decision.getAllActioned(limit, userroles, function (access, err, result) {
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
 * /virtualward_decision/updateContact:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates the Preferred Contact information
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: information to update.
 *           schema:
 *              type: object
 *              properties:
 *                  id:
 *                     type: string
 *                  contact:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Task Updated
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
  "/updateContact",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.type("application/json");
    if (req.body && req.body.contact && req.body.id) {
      const id = req.body.id;
      const contact = req.body.contact;
      virtualward_decision.updateContactInfo(id, contact, (err, data) => {
        if (err) {
          res.status(400).send(
            JSON.stringify({
              reason: "Error: " + err,
            })
          );
        } else {
          res.status(200).json({ success: true });
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

/**
 * @swagger
 * /virtualward_decision/clearContact:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Clears the VW preferred contact info
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: information to update.
 *           schema:
 *              type: object
 *              properties:
 *                  id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Task Updated
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
  "/clearContact",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.type("application/json");
    if (req.body && req.body.id) {
      const id = req.body.id;
      virtualward_decision.removeContactInfo(id, (err, data) => {
        if (err) {
          res.status(400).send(
            JSON.stringify({
              reason: "Error: " + err,
            })
          );
        } else {
          res.status(200).json({ success: true });
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

/**
 * @swagger
 * /virtualward_decision/updateNotes:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates the VW notes
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: information to update.
 *           schema:
 *              type: object
 *              properties:
 *                  id:
 *                     type: string
 *                  notes:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Task Updated
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
  "/updateNotes",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.type("application/json");
    if (req.body && req.body.notes && req.body.id) {
      const id = req.body.id;
      const notes = req.body.notes;
      virtualward_decision.updateNotes(id, notes, (err, data) => {
        if (err) {
          res.status(400).send(
            JSON.stringify({
              reason: "Error: " + err,
            })
          );
        } else {
          res.status(200).json({ success: true });
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

/**
 * @swagger
 * /virtualward_decision/clearNotes:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Clears the VW notes
 *     tags:
 *      - VirtualWards
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: Payload
 *           description: information to update.
 *           schema:
 *              type: object
 *              properties:
 *                  id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Task Updated
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
  "/clearNotes",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.type("application/json");
    if (req.body && req.body.id) {
      const id = req.body.id;
      virtualward_decision.removeNotes(id, (err, data) => {
        if (err) {
          res.status(400).send(
            JSON.stringify({
              reason: "Error: " + err,
            })
          );
        } else {
          res.status(200).json({ success: true });
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
