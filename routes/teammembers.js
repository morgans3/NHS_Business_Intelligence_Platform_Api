// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const TeamMemberModel = new DIULibrary.Models.TeamMemberModel();
const JWT = require("jsonwebtoken");
const RoleFunctions = require("../helpers/role_functions");

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
        TeamMemberModel.get((err, result) => {
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
 *       - name: organisation
 *         description: Member's Organisation
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Member Registration
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
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            teamcode: { type: "string" },
            username: { type: "string" },
            joindate: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
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
                // Create item
                const member = {
                    teamcode: req.body.teamcode,
                    username: req.body.username,
                    joindate: req.body.joindate,
                };
                if (req.body.organisation) member["organisation"] = req.body.organisation;
                if (req.body.rolecode) member["rolecode"] = req.body.rolecode;
                if (req.body.enddate) member["enddate"] = req.body.enddate;

                // Persist in database
                TeamMemberModel.create(member, (err, result) => {
                    if (err) {
                        res.status(500).json({ success: false, msg: "Failed to create " + err });
                    } else {
                        res.json({ success: true, msg: "Team member created successfully", data: member });
                    }
                });
            }
        });
    }
);

/**
 * @swagger
 * /teammembers/update:
 *   put:
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
 *       - name: organisation
 *         description: Member's Organisation
 *         in: formData
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
            teamcode: { type: "string" },
            username: { type: "string" },
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
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
                // Create item
                const member = { username: req.body.username };
                if (req.body.organisation) member["organisation"] = req.body.organisation;
                if (req.body.rolecode) member["rolecode"] = req.body.rolecode;
                if (req.body.enddate) member["enddate"] = req.body.enddate;

                TeamMemberModel.getByKeys({ id: req.body.id, teamcode: req.body.teamcode }, (errGet, errResult) => {
                    if (errGet) {
                        res.status(500).json({ success: false, msg: errGet });
                    } else if (errResult.Items.length === 0) {
                        res.status(404).json({ success: false, msg: "Member not found" });
                    } else {
                        TeamMemberModel.update(
                            {
                                id: req.body.id,
                                teamcode: req.body.teamcode,
                            },
                            member,
                            (err, result) => {
                                if (err) {
                                    res.status(500).json({ success: false, msg: "Failed to update " + err });
                                } else {
                                    res.json({ success: true, msg: "Team member updated successfully", data: member });
                                }
                            }
                        );
                    }
                });
            }
        });
    }
);

/**
 * @swagger
 * /teammembers/teamcode/{code}:
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
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       401:
 *         description: Unauthorized
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
 * /teammembers/username/{username}:
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
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       401:
 *         description: Unauthorized
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
 * /teammembers/delete:
 *   delete:
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
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcode
 *         description: Team Code
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Member being deleted
 *       401:
 *         description: Unauthorized
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
            teamcode: { type: "string" },
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const keys = {
            id: req.body.id,
            teamcode: req.body.teamcode,
        };

        TeamMemberModel.delete(keys, (err, errResult) => {
            if (err) {
                res.status(500).json({ success: false, msg: "Failed to delete: " + err });
                return;
            }
            if (errResult.Attributes) {
                res.send({ success: true, msg: "Payload deleted", data: errResult.Attributes });
            } else {
                res.status(404).json({ success: false, msg: "Payload not found" });
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
    (req, res, next) => {
        TeamMemberModel.getByKeys({ id: req.params.id }, (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }

            if (result.Items.length === 0) {
                res.status(404).json({ success: false, msg: "Team member not found" });
            } else {
                res.json(result.Items[0]);
            }
        });
    }
);

module.exports = router;
