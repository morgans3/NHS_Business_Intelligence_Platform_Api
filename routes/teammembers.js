// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Members = require("../models/teammembers");

/**
 * @swagger
 * tags:
 *   name: TeamMembers
 *   description: Members of this group
 */

/**
 * @swagger
 * /teammembers/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a Member
 *     tags:
 *      - TeamMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: teamcode
 *         description: Team Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: Member Username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: rolecode
 *         description: Member's Role
 *         in: formData
 *         type: string
 *       - name: joindate
 *         description: Member's Join Date
 *         in: formData
 *         required: true
 *         type: string
 *         format: date
 *       - name: enddate
 *         description: Member's Leaving Date
 *         in: formData
 *         type: string
 *         format: date
 *     responses:
 *       200:
 *         description: Confirmation of Member Registration
 */
router.post(
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let newMember = {
      teamcode: { S: req.body.teamcode },
      username: { S: req.body.username },
      joindate: { S: req.body.joindate },
    };
    if (req.body.rolecode) newMember["rolecode"] = { S: req.body.rolecode };
    if (req.body.enddate) newMember["enddate"] = { S: req.body.enddate };
    Members.addteamMember(newMember, (err, method) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to register: " + err,
        });
      } else {
        res.json({
          success: true,
          msg: "Registered",
        });
      }
    });
  }
);

/**
 * @swagger
 * /teammembers/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - TeamMembers
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
    Members.getAll(function (err, result) {
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
 * /teammembers/getTeamMembersByCode?code={code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the Members of a Team
 *     tags:
 *      - TeamMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Teams Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTeamMembersByCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const code = req.query.code;
    Members.getteamMembersByteam(code, function (err, result) {
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
 * /teammembers/getTeamMembershipsByUsername?username={username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the Teams a Member belongs to
 *     tags:
 *      - TeamMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: Unique Username
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTeamMembershipsByUsername",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const username = req.query.username;
    Members.getteamsByMember(username, function (err, result) {
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
 * /teammembers/archive?member_id={member_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Member from a Group
 *     tags:
 *      - TeamMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: member_id
 *         description: Member's ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Member being Archived
 */
router.put(
  "/archive",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.member_id;
    Members.getteamMemberById(id, function (err, scan) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }

      if (scan.Items.length > 0) {
        let member = scan.Items[0];
        Members.remove(member._id, member.teamcode, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to archive: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Archived",
          });
        });
      } else {
        res.json({
          success: false,
          msg: "Can not find item in database.",
        });
      }
    });
  }
);

module.exports = router;
