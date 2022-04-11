const express = require("express");
const router = express.Router();
const passport = require("passport");
const Members = require("../models/organisationmembers");

/**
 * @swagger
 * tags:
 *   name: OrgMembers
 *   description: Members of this group
 */

/**
 * @swagger
 * /organisationmembers/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a Member
 *     tags:
 *      - OrgMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: organisationcode
 *         description: Organisation Code
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
 *       - name: isArchived
 *         description: Is Member inactive
 *         in: formData
 *         required: true
 *         type: boolean
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
    let isarchive = false;
    if (req.body.isArchived === "true") isarchive = true;
    let newMember = {
      organisationcode: { S: req.body.organisationcode },
      username: { S: req.body.username },
      joindate: { S: req.body.joindate },
      isArchived: { BOOL: isarchive },
    };
    if (req.body.rolecode) newMember["rolecode"] = { S: req.body.rolecode };
    if (req.body.enddate) newMember["enddate"] = { S: req.body.enddate };
    Members.addOrgMember(newMember, (err, method) => {
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
 * /organisationmembers/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - OrgMembers
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
 * /organisationmembers/getOrgMembersByCode?code={code}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the Members of an Organisation
 *     tags:
 *      - OrgMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisations Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getOrgMembersByCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const code = req.query.code;
    Members.getOrgMembersByOrg(code, function (err, result) {
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
 * /organisationmembers/getOrgMembershipsByUsername?username={username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the Organisations a Member belongs to
 *     tags:
 *      - OrgMembers
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
  "/getOrgMembershipsByUsername",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const username = req.query.username;
    Members.getOrgMembershipsByUsername(username, function (err, result) {
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
 * /organisationmembers/archive?member_id={member_id}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Member from a Group
 *     tags:
 *      - OrgMembers
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
    Members.getOrgMemberById(id, function (err, scan) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      if (scan.Items.length > 0) {
        let member = scan.Items[0];
        member.isArchived = true;
        member.enddate = new Date();
        Members.update(member, function (err) {
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
