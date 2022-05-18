// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const uuid = require("uuid");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const TeamModel = new DIULibrary.Models.TeamModel();
const JWT = require("jsonwebtoken");
const RoleFunctions = require("../helpers/role_functions");

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Teams CRUD functionality
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get all teams
 *     tags:
 *      - Teams
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A list of all teams
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        TeamModel.get((err, result) => {
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
 * /teams/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create a new team
 *     tags:
 *      - Teams
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: team
 *        description: The team details
 *        schema:
 *          type: object
 *          required:
 *            - code
 *            - name
 *            - description
 *            - organisationcode
 *          properties:
 *            code:
 *              type: string
 *              description: Unique team code
 *            name:
 *              type: string
 *              description: Team name
 *            description:
 *              type: string
 *              description: Team description
 *            organisationcode:
 *              type: string
 *              description: Organisation code
 *            responsiblepeople:
 *              type: array
 *              items:
 *                type: string
 *                description: Array of responsible people for the team
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The newly created team
 *       400:
 *        description: Bad request
 *       401:
 *        description: Unauthorized
 *       500:
 *        description: Internal server error
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            code: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            organisationcode: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    async (req, res, next) => {
        const payload = req.body;
        const team = {
            _id: uuid.v1(),
            code: payload.code,
            description: payload.description,
            name: payload.name,
            organisationcode: payload.organisationcode,
            responsiblepeople: payload.responsiblepeople || [],
        };

        // Persist in database
        TeamModel.create(team, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: "Failed to create " + err });
            } else {
                res.json({ success: true, msg: "Team created successfully", data: team });
            }
        });
    }
);

/**
 * @swagger
 * /teams/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Update an existing team
 *     tags:
 *      - Teams
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: team
 *        description: The team details
 *        schema:
 *          type: object
 *          required:
 *            - _id
 *            - code
 *            - name
 *            - description
 *            - organisationcode
 *          properties:
 *            _id:
 *              type: string
 *              description: Id of team to update
 *            code:
 *              type: string
 *              description: Unique team code
 *            name:
 *              type: string
 *              description: Team name
 *            description:
 *              type: string
 *              description: Team description
 *            organisationcode:
 *              type: string
 *              description: Organisation code
 *            responsiblepeople:
 *              type: array
 *              items:
 *                type: string
 *                description: Array of responsible people for the team
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The updated team
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.all(
    "/update",
    passport.authenticate("jwt", {
        // Router set to all for teamprofile update redirect
        session: false,
    }),
    async (req, res, next) => {
        const token = req.header("authorization");
        const decodedToken = JWT.decode(token.replace("JWT ", ""));
        const username = decodedToken["username"];
        const payload = req.body;
        RoleFunctions.checkTeamAdmin(username, { code: req.body.code }, (errCheck, resultCheck, teamCheck) => {
            if (errCheck) {
                res.status(500).send({ success: false, msg: errCheck });
                return;
            }
            if (!teamCheck) {
                res.status(404).send({ success: false, msg: "Team does not exist" });
                return;
            }
            if (!resultCheck) {
                res.status(403).send({ success: false, msg: "User not authorized to update team" });
            } else {
                // Check team exists
                TeamModel.update(
                    {
                        _id: payload["_id"],
                        code: payload.code,
                    },
                    {
                        description: payload.description,
                        name: payload.name,
                        organisationcode: payload.organisationcode,
                        responsiblepeople: payload.responsiblepeople || [],
                    },
                    (err, team) => {
                        if (err) {
                            res.status(500).json({ success: false, msg: "Failed to update " + err });
                        } else {
                            res.json({ success: true, msg: "Team updated successfully", data: team });
                        }
                    }
                );
            }
        });
    }
);

/**
 * @swagger
 * /teams/getTeamByCode:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the profile for a Team
 *     tags:
 *      - Teams
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
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/getTeamByCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "query",
        {
            code: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const code = req.query.code;
        TeamModel.getByCode(code, function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items.length > 0) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.status(404).send({ success: false, msg: "Team does not exist" });
                }
            }
        });
    }
);

/**
 * @swagger
 * /teams/getTeamsByOrgCode:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the teams associated to the Organisation
 *     tags:
 *      - Teams
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: orgcode
 *         description: Organisation's Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/getTeamsByOrgCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "query",
        {
            orgcode: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const orgcode = req.query.orgcode;
        TeamModel.getByOrg(orgcode, function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items.length > 0) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.status(404).send({ success: false, msg: "Teams not found" });
                }
            }
        });
    }
);

/**
 * @swagger
 * /teams/getTeamsByPartialTeamName:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the teams that match the search criteria
 *     tags:
 *      - Teams
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: partialteam
 *         description: Partial Team Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/getTeamsByPartialTeamName",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "query",
        {
            partialteam: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const partialteam = req.query.partialteam;
        TeamModel.getByFilters(
            {
                name: partialteam,
            },
            function (err, result) {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                } else {
                    if (result.Items.length > 0) {
                        res.send(JSON.stringify(result.Items));
                    } else {
                        res.status(404).send({ success: false, msg: "Teams not found" });
                    }
                }
            }
        );
    }
);

/**
 * @swagger
 * /teams/getTeamsByPartialTeamNameAndOrgCode:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the teams that match the search criteria
 *     tags:
 *      - Teams
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: orgcode
 *         description: Organisation Code
 *         in: query
 *         required: true
 *         type: string
 *       - name: partialteam
 *         description: Partial Team Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/getTeamsByPartialTeamNameAndOrgCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "query",
        {
            partialteam: { type: "string" },
            orgcode: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const orgcode = req.query.orgcode;
        const name = req.query.partialteam;
        TeamModel.getByFilters(
            {
                name,
                orgcode,
            },
            function (err, result) {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                } else {
                    if (result.Items.length > 0) {
                        res.send(JSON.stringify(result.Items));
                    } else {
                        res.status(404).send({ success: false, msg: "Teams not found" });
                    }
                }
            }
        );
    }
);

/**
 * @swagger
 * /teams/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a team by it's id and code
 *     tags:
 *      - Teams
 *     parameters:
 *       - name: _id
 *         description: Id of team to delete
 *         in: formData
 *         required: true
 *         type: string
 *       - name: code
 *         description: Code of team to delete
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Team deletion status
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            _id: { type: "string" },
            code: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const token = req.header("authorization");
        const decodedToken = JWT.decode(token.replace("JWT ", ""));
        const username = decodedToken["username"];
        RoleFunctions.checkTeamAdmin(username, { code: req.body.code }, (errCheck, resultCheck) => {
            if (errCheck) {
                res.status(500).send({ success: false, msg: errCheck });
                return;
            }
            if (!resultCheck) {
                res.status(403).send({ success: false, msg: "User not authorized to update team" });
            } else {
                TeamModel.delete(
                    {
                        _id: req.body["_id"],
                        code: req.body.code,
                    },
                    (err, result) => {
                        if (err) {
                            res.status(500).json({ success: false, msg: err });
                        } else {
                            res.json({ success: true, msg: "Team deleted successfully" });
                        }
                    }
                );
            }
        });
    }
);

module.exports = router;
