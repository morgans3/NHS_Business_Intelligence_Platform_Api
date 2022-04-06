// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");

const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const Authenticate = require("../models/authenticate");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const userroles = new DIULibrary.Models.UserRoleModel(AWS);

/**
 * @swagger
 * tags:
 *   name: UserRoles
 *   description: (To be deprecated) Roles attached to User Profiles
 */

/**
 * @swagger
 * /userroles/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers or Updates an Item
 *     tags:
 *      - UserRoles
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: userroles
 *           description: The user role details.
 *           schema:
 *                type: object
 *                properties:
 *                  username:
 *                     type: string
 *                  roleassignedDT:
 *                     type: string
 *                  role:
 *                    type: object
 *                  assignedby:
 *                    type: string
 *                  organisationid:
 *                     type: string
 *     responses:
 *       200:
 *         description: Confirmation of Item Registration
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
  "/register",
  [
    passport.authenticate("jwt", {
      session: false,
    }),
    MiddlewareHelper.checkOrigin,
    MiddlewareHelper.userHasCapability('Hall Monitor'),
  ],
  (req, res, next) => {
    if (req.body && req.body.username && req.body.roleassignedDT) {
      const item = req.body;
      userroles.getByID(item.username, item.roleassignedDT, function (err, app) {
        if (err) {
          res.json({
            success: false,
            msg: "Failed to update: " + err,
          });
        }
        if (app.Items.length > 0) {
          var scannedItem = app.Items[0];
          const date = new Date();
          const archiveindex = scannedItem.username + "_" + date.toISOString().slice(0, 19).replace("T", "").replace(/:/g, "").replace(/-/g, "");
          let archiveItem = {
            username: { S: archiveindex },
            roleassignedDT: { S: scannedItem.roleassignedDT },
          };

          if (scannedItem.role) archiveItem.role = AWS.DynamoDB.Converter.input(scannedItem.role);
          if (scannedItem.assignedby) archiveItem.assignedby = { S: scannedItem.assignedby };
          if (scannedItem.organisationid) archiveItem.organisationid = { S: scannedItem.organisationid };

          userroles.updateArchive(archiveItem, function (error, data) {
            if (error) {
              console.log("Unable to archive old labtest: " + error);
            }
          });

          if (item.role) scannedItem.role = item.role;
          if (item.assignedby) scannedItem.assignedby = item.assignedby;
          if (item.organisationid) scannedItem.organisationid = item.organisationid;

          userroles.updateItem(scannedItem, function (err, data) {
            if (err) {
              res.json({
                success: false,
                msg: "Failed to update: " + err,
              });
            }
            res.json({
              success: true,
              msg: "Item updated",
            });
          });
        } else {
          const assignedDT = new Date().toISOString();
          let newItem = {
            username: { S: item.username },
            roleassignedDT: { S: assignedDT },
          };

          if (item.role) newItem.role = AWS.DynamoDB.Converter.input(item.role);
          if (item.assignedby) newItem.assignedby = { S: item.assignedby };
          if (item.organisationid) newItem.organisationid = { S: item.organisationid };

          userroles.addItem(newItem, (err, user) => {
            if (err) {
              res.status(400).json({
                success: false,
                msg: "Failed to register: " + err,
              });
            } else {
              res.status(200).json({
                success: true,
                msg: "Registered",
              });
            }
          });
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
 * /userroles/remove:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Removes the Item
 *     tags:
 *      - UserRoles
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: userroles
 *           description: The user role details.
 *           schema:
 *                type: object
 *                properties:
 *                  username:
 *                     type: string
 *                  roleassignedDT:
 *                     type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request, server doesn't understand input
 *       401:
 *         description: Unauthorised
 */
router.post(
  "/remove",
  [
    passport.authenticate("jwt", {
      session: false,
    }),
    MiddlewareHelper.checkOrigin,
    MiddlewareHelper.userHasCapability('Hall Monitor'),
  ],
  (req, res, next) => {
    const username = req.body.username;
    const roleassignedDT = req.body.roleassignedDT;
    userroles.removeItem(username, roleassignedDT, function (err, result) {
      if (err) {
        res.json(result);
      } else {
        res.json({
          success: true,
          msg: "Item removed",
        });
      }
    });
  }
);

/**
 * @swagger
 * /userroles/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - UserRoles
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 *       401:
 *         description: Unauthorised
 */
router.get(
  "/getAll",
  [
    passport.authenticate("jwt", {
      session: false,
    }),
    MiddlewareHelper.checkOrigin,
    MiddlewareHelper.userHasCapability('Hall Monitor'),
  ],
  (req, res, next) => {
    userroles.getAll(function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send("[]");
        }
      }
    });
  }
);

/**
 * @swagger
 * /userroles/getItemsByUsername?username={username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - UserRoles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: Username
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       401:
 *         description: Unauthorised
 */
router.get(
  "/getItemsByUsername",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const username = req.url.replace("/getItemsByUsername?username=", "");
    userroles.getItemsByUsername(username, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send("[]");
        }
      }
    });
  }
);

/**
 * @swagger
 * /userroles/changemytrainingsystemrole:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates an Item, specifically HiPRES roles
 *     tags:
 *      - UserRoles
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: userroles
 *           description: The user role details.
 *           schema:
 *                type: object
 *                properties:
 *                  role:
 *                    type: object
 *     responses:
 *       200:
 *         description: Confirmation of Item updating and new Token
 *       400:
 *         description: Bad Request, server doesn't understand input
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server connection problem or Error Processing Result
 */
router.post(
  "/changemytrainingsystemrole",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const auth = req.headers["authorization"];
    if (auth) {
      const decoded = jwt.decode(auth.replace("JWT ", ""));
      const username = decoded["username"];
      const _id = decoded["_id"];
      const mfa = decoded["mfa"];
      userroles.getItemsByUsernameAndOrgID(username, _id, (err, result) => {
        if (err) {
          res.status(502).send({ success: false, msg: err });
          return;
        }
        if (result.Items && result.Items.length > 0) {
          const trainingrole = result.Items.filter((x) => x.assignedby.toLowerCase().includes("raining"));
          if (trainingrole.length > 0) {
            const role = trainingrole[0];
            const item = req.body;
            if (item.role) role.role = item.role;
            userroles.updateItem(role, (error, roleres) => {
              if (error) {
                res.status(502).send({ success: false, msg: error });
                return;
              } else {
                Authenticate.upgradePassportwithOrganisation(decoded, mfa, (err2, token) => {
                  if (err2) {
                    res.status(400).send({ success: false, msg: err2 });
                    return;
                  }
                  res.status(200).send({ success: true, token: token });
                });
              }
            });
          } else {
            res.status(400).send({ success: false, msg: "No Training System Roles to update" });
            return;
          }
        } else {
          {
            res.status(400).send({ success: false, msg: "No Roles to update for " + username + "(" + _id + ")" });
            return;
          }
        }
      });
    } else {
      res.status(400).send({ success: false, msg: "Unauthenticated" });
    }
  }
);

module.exports = router;
