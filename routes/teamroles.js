// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const AWS = require("aws-sdk");

const DIULibrary = require("diu-data-functions");
const teamroles = new DIULibrary.Models.TeamRoleModel(AWS);
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: TeamRoles
 *   description: (To be deprecated) Roles attached to Team Profiles
 */

/**
 * @swagger
 * /teamroles/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers or Updates an Item
 *     tags:
 *      - TeamRoles
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: teamroles
 *           description: The team role details.
 *           schema:
 *                type: object
 *                properties:
 *                  teamcode:
 *                     type: string
 *                  roleassignedDT:
 *                     type: string
 *                  role:
 *                    type: object
 *                  assignedby:
 *                    type: string
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
    if (req.body && req.body.teamcode && req.body.roleassignedDT) {
      const item = req.body;
      teamroles.getByID(item.teamcode, item.roleassignedDT, function (err, app) {
        if (err) {
          res.json({
            success: false,
            msg: "Failed to update: " + err,
          });
        }
        if (app.Items.length > 0) {
          var scannedItem = app.Items[0];
          const date = new Date();
          const archiveindex = scannedItem.teamcode + "_" + date.toISOString().slice(0, 19).replace("T", "").replace(/:/g, "").replace(/-/g, "");
          let archiveItem = {
            teamcode: { S: archiveindex },
            roleassignedDT: { S: scannedItem.roleassignedDT },
          };

          if (scannedItem.role) archiveItem.role = AWS.DynamoDB.Converter.input(scannedItem.role);
          if (scannedItem.assignedby) archiveItem.assignedby = { S: scannedItem.assignedby };

          teamroles.updateArchive(archiveItem, function (error, data) {
            if (error) {
              console.log("Unable to archive old labtest: " + error);
            }
          });

          if (item.role) scannedItem.role = item.role;
          if (item.assignedby) scannedItem.assignedby = item.assignedby;

          teamroles.updateItem(scannedItem, function (err, data) {
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
            teamcode: { S: item.teamcode },
            roleassignedDT: { S: assignedDT },
          };

          if (item.role) newItem.role = AWS.DynamoDB.Converter.input(item.role);
          if (item.assignedby) newItem.assignedby = { S: item.assignedby };

          teamroles.addItem(newItem, (err, team) => {
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
 * /teamroles/remove:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Removes the Item
 *     tags:
 *      - TeamRoles
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: teamroles
 *           description: The team role details.
 *           schema:
 *                type: object
 *                properties:
 *                  teamcode:
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
    const teamcode = req.body.teamcode;
    const roleassignedDT = req.body.roleassignedDT;
    teamroles.removeItem(teamcode, roleassignedDT, function (err, result) {
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
 * /teamroles/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamRoles
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
    teamroles.getAll(function (err, result) {
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
 * /teamroles/getItemsByTeamcode?teamcode={teamcode}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamRoles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: teamcode
 *         description: Teamcode
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
  "/getItemsByTeamcode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const teamcode = req.url.replace("/getItemsByTeamcode?teamcode=", "");
    teamroles.getItemsByTeamcode(teamcode, function (err, result) {
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

module.exports = router;
