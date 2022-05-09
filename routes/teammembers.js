// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const TeamMemberModel = new DIULibrary.Models.TeamMemberModel();

/**
 * @swagger
 * tags:
 *   name: TeamMembers
 *   description: Members of this group
 */

/**
 * @swagger
 * /teammembers/:
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
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        TeamMemberModel.get((err, result) => {
            // Return data
            if (err) {
                res.status(500).json({ success: false, msg: err });
            } else {
                res.json(result.Items);
            }
        });
    }
);

/**
 * @swagger
 * /teammembers/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create a Member
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
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // Create item
        const member = {
            teamcode: req.body.teamcode,
            username: req.body.username,
            joindate: req.body.joindate,
        };
        if (req.body.rolecode) member["rolecode"] = req.body.rolecode;
        if (req.body.enddate) member["enddate"] = req.body.enddate;

        // Persist in database
        TeamMemberModel.create(member, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: "Failed to create " + err });
            } else {
                res.json({ success: true, msg: "Team member created successfully!", data: member });
            }
        });
    }
);

/**
 * @swagger
 * /teammembers/update:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Update a Member
 *     tags:
 *      - TeamMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Id of member
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcode
 *         description: Team code of member
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
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // Create item
        const member = { username: req.body.username };
        if (req.body.rolecode) member["rolecode"] = req.body.rolecode;
        if (req.body.enddate) member["enddate"] = req.body.enddate;

        // Persist in database
        TeamMemberModel.update(
            {
                _id: req.body.id,
                teamcode: req.body.teamcode,
            },
            member,
            (err, result) => {
                if (err) {
                    res.status(500).json({ success: false, msg: "Failed to update " + err });
                } else {
                    res.json({ success: true, msg: "Team member updated successfully!", data: member });
                }
            }
        );
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
        TeamMemberModel.getByTeamCode(code, function (err, result) {
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
        TeamMemberModel.getByUsername(username, function (err, result) {
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
 * /teammembers/archive:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Removes a Member from a Group
 *     tags:
 *      - TeamMembers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Team member id
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
        TeamMemberModel.getByKeys({ _id: req.query.id }, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: "Failed to find item: " + err });
            }
            if (result.Items && result.Items.length > 0) {
                const member = result.Items[0];
                TeamMemberModel.delete(
                    {
                        _id: member["_id"],
                        teamcode: member.teamcode,
                    },
                    (memberDeleteErr) => {
                        if (err) {
                            res.status(500).json({ success: false, msg: "Failed to archive: " + memberDeleteErr });
                        } else {
                            res.json({ success: true, msg: "Archived" });
                        }
                    }
                );
            } else {
                res.status(404).json({ success: false, msg: "Can not find item in database." });
            }
        });
    }
);

/**
 * @swagger
 * /teammembers/{id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns a teamember object
 *     tags:
 *      - TeamMembers
 *     parameters:
 *      - name: id
 *        description: Team member id
 *        type: string
 *        in: path
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Teammember object
 */
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        TeamMemberModel.getByKeys({ _id: req.params.id }, (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }

            // Found item?
            if (result.Items.length === 0) {
                res.status(404).json({ success: false, msg: "Team member not found!" });
            } else {
                res.json(result.Items[0]);
            }
        });
    }
);

module.exports = router;
