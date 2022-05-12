// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const uuid = require("uuid");

const DIULibrary = require("diu-data-functions");
const TeamModel = new DIULibrary.Models.TeamModel();

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
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        TeamModel.get((err, result) => {
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
 * /teams/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create a new team
 *     tags:
 *      - Teams
 *     parameters:
 *       - name: code
 *         description: Team code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Team name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: Team description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisationcode
 *         description: Team organisation code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: responsiblepeople
 *         description: Array of responsible people for the team
 *         in: formData
 *         type: array
 *         items:
 *           type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The newly created team
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    async (req, res, next) => {
        // Get params
        const payload = req.body;
        const team = {
            _id: uuid.v1(),
            code: payload.code,
            description: payload.description,
            name: payload.name,
            organisationcode: payload.organisationcode,
            responsiblepeople: payload.responsiblepeople ? payload.responsiblepeople.split(",") : [],
        };

        // Persist in database
        TeamModel.create(team, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: "Failed to create " + err });
            } else {
                res.json({ success: true, msg: "Team created successfully!", data: team });
            }
        });
    }
);

/**
 * @swagger
 * /teams/update:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Update an existing team
 *     tags:
 *      - Teams
 *     parameters:
 *       - name: id
 *         description: Id of team to update
 *         in: formData
 *         required: true
 *         type: string
 *       - name: code
 *         description: Code of team to update
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Team name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: Team description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisationcode
 *         description: Team organisation code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: responsiblepeople
 *         description: Array of responsible people for the team
 *         in: formData
 *         type: array
 *         explode: true
 *         items:
 *           type: string
 *       - name: roles
 *         description: Array of role ids for the team
 *         in: formData
 *         type: array
 *         explode: true
 *         items:
 *           type: integer
 *       - name: capabilities
 *         description: Array of capability ids for the team
 *         in: formData
 *         type: array
 *         explode: true
 *         items:
 *           type: integer
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The updated team
 */
router.all(
    "/update",
    passport.authenticate("jwt", {
        // Router set to all for teamprofile update redirect
        session: false,
    }),
    async (req, res, next) => {
        // TODO: check if user is allowed to update team

        // Get params
        const payload = req.body;

        // For teamprofile update redirect
        payload.id = req.query.profile_id;

        // Update team
        TeamModel.update(
            {
                _id: payload.id,
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
                    res.json({ success: false, msg: "Failed to update " + err });
                } else {
                    res.json({ success: true, msg: "Team updated successfully!", data: team });
                }
            }
        );
    }
);

/**
 * @swagger
 * /teams/getTeamByCode?code={code}:
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
 */
router.get(
    "/getTeamByCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const code = req.query.code;
        TeamModel.getByCode(code, function (err, result) {
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
 * /teams/getTeamsByOrgCode?orgcode={orgcode}:
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
 */
router.get(
    "/getTeamsByOrgCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const orgcode = req.query.orgcode;
        TeamModel.getByOrg(orgcode, function (err, result) {
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
 * /teams/getTeamsByPartialTeamName?partialteam={partialteam}:
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
 */
router.get(
    "/getTeamsByPartialTeamName",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                    if (result.Items) {
                        res.send(JSON.stringify(result.Items));
                    } else {
                        res.send(JSON.stringify([]));
                    }
                }
            }
        );
    }
);

/**
 * @swagger
 * /teams/getTeamsByPartialTeamNameAndOrgCode?orgcode={orgcode}&partialteam={partialteam}:
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
 */
router.get(
    "/getTeamsByPartialTeamNameAndOrgCode",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const orgcode = req.url.split("=")[1].replace("&partialteam", "");
        const partialteam = req.url.split("=")[2];
        TeamModel.getByFilters(
            {
                name: partialteam,
                orgcode,
            },
            function (err, result) {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                } else {
                    if (result.Items) {
                        res.send(JSON.stringify(result.Items));
                    } else {
                        res.send(JSON.stringify([]));
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
 *       - name: id
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
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // TODO: check if user is allowed to update team
        TeamModel.delete(
            {
                _id: req.body.id,
                code: req.body.code,
            },
            (err, result) => {
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                } else {
                    res.json({ success: true, msg: "Team deleted successfully!" });
                }
            }
        );
    }
);

module.exports = router;
