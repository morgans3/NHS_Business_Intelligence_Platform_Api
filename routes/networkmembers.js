// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Members = require("../models/networkmembers");

/**
 * @swagger
 * tags:
 *   name: NetworkMembers
 *   description: Members of this group
 */

/**
 * @swagger
 * /networkmembers/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a Member
 *     tags:
 *      - NetworkMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: networkcode
 *         description: Network Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcode
 *         description: Member TeamCode
 *         in: formData
 *         required: true
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
      networkcode: { S: req.body.networkcode },
      teamcode: { S: req.body.teamcode },
      joindate: { S: req.body.joindate },
    };
    if (req.body.enddate) newMember["enddate"] = { S: req.body.enddate };
    Members.addNetworkMember(newMember, (err, method) => {
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
 * /networkmembers/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - NetworkMembers
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
 * /networkmembers/getNetworkMembersByCode?code={code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the Members of a Network
 *     tags:
 *      - NetworkMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Networks Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getNetworkMembersByCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const code = req.query.code;
    Members.getNetworkMembersByNetwork(code, function (err, result) {
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
 * /networkmembers/getNetworkMembershipsByTeamCode?teamcode={teamcode}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the Networks a Member belongs to
 *     tags:
 *      - NetworkMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: teamcode
 *         description: Unique TeamCode
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getNetworkMembershipsByTeamCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const teamcode = req.query.teamcode;
    Members.getNetworksByMember(teamcode, function (err, result) {
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
 * /networkmembers/archive?member_id={member_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Member from a Group
 *     tags:
 *      - NetworkMembers
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
    Members.getNetworkMemberById(id, function (err, member) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }

      if (member.Items.length === 0) {
        res.json({
          success: false,
          msg: "Item not found in database.",
        });
      } else {
        let item = member.Items[0];
        Members.remove(item, function (err) {
          if (err) {
            res.json({
              success: false,
              msg: "Failed to remove: " + err,
            });
          }
          res.json({
            success: true,
            msg: "Removed",
          });
        });
      }
    });
  }
);

module.exports = router;
