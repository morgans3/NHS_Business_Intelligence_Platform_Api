// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const RoleFunctions = require("../helpers/role_functions");
const DIULibrary = require("diu-data-functions");
const CohortModel = new DIULibrary.Models.CohortModel();
const JWT = require("jsonwebtoken");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: Cohorts
 *   description: Cohorts on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /cohorts:
 *   get:
 *     description: Get a list of cohorts
 *     security:
 *      - JWT: []
 *     tags:
 *      - Cohorts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: Filter by name
 *         in: query
 *         required: false
 *         type: string
 *       - name: username
 *         description: Filter by username
 *         in: query
 *         required: false
 *         type: string
 *       - name: teamcode
 *         description: Filter by teamcode
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
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
        CohortModel.get(req.query, (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send(result.Items);
        });
    }
);

/**
 * @swagger
 * /cohorts/create:
 *   post:
 *     description: Create a new cohort
 *     security:
 *      - JWT: []
 *     tags:
 *      - Cohorts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: cohortName
 *         description: Cohort name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: cohorturl
 *         description: Cohort url
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcode
 *         description: Team code to link to cohort
 *         in: formData
 *         required: false
 *         type: string
 *       - name: username
 *         description: Username to link to cohort
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
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
            cohortName: { type: "string" },
            cohorturl: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        CohortModel.create(
            {
                cohortName: req.body.cohortName,
                cohorturl: req.body.cohorturl,
                teamcode: req.body.teamcode,
                user: req.body.username,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: true, msg: "New cohort created", data });
            }
        );
    }
);

/**
 * @swagger
 * /cohorts/update:
 *   put:
 *     description: Create a new cohort
 *     security:
 *      - JWT: []
 *     tags:
 *      - Cohorts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Id of the cohort to update
 *         in: formData
 *         required: true
 *         type: string
 *       - name: cohortName
 *         description: Cohort name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: cohorturl
 *         description: Cohort url
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcode
 *         description: Team code to link to cohort
 *         in: formData
 *         required: false
 *         type: string
 *       - name: username
 *         description: Username to link to cohort
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
            cohortName: { type: "string" },
            cohorturl: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        if (req.body.teamcode) {
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
                    CohortModel.update(
                        {
                            _id: req.body.id,
                        },
                        {
                            cohortName: req.body.cohortName,
                            cohorturl: req.body.cohorturl,
                            teamcode: req.body.teamcode,
                            user: req.body.username,
                        },
                        (err, data) => {
                            if (err) {
                                res.status(500).send({ success: false, msg: err });
                                return;
                            }
                            res.send({ success: true, msg: "Cohort updated", data });
                        }
                    );
                }
            });
        } else {
            CohortModel.update(
                {
                    _id: req.body.id,
                },
                {
                    cohortName: req.body.cohortName,
                    cohorturl: req.body.cohorturl,
                    user: req.body.username,
                },
                (err, data) => {
                    if (err) {
                        res.status(500).send({ success: false, msg: err });
                        return;
                    }
                    res.send({ success: true, msg: "Cohort updated", data });
                }
            );
        }
    }
);

/**
 * @swagger
 * /cohorts/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a cohort
 *     tags:
 *      - Cohorts
 *     parameters:
 *       - name: id
 *         description: Id of the cohort to delete
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
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
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const key = {
            _id: req.body.id,
        };
        CohortModel.getByKeys(key, (errGet, resultGet) => {
            if (errGet) {
                res.status(500).send({ success: false, msg: errGet });
                return;
            }
            if (resultGet.Items.length === 0) {
                res.status(404).send({ success: false, msg: "Cohort not found" });
                return;
            }
            if (resultGet.Items[0].teamcode) {
                const token = req.header("authorization");
                const decodedToken = JWT.decode(token.replace("JWT ", ""));
                const username = decodedToken["username"];
                RoleFunctions.checkTeamAdmin(username, { code: resultGet.Items[0].teamcode }, (errCheck, resultCheck) => {
                    if (errCheck) {
                        res.status(500).send({ success: false, msg: errCheck });
                        return;
                    }
                    if (!resultCheck) {
                        res.status(403).send({ success: false, msg: "User not authorized to update team" });
                    } else {
                        CohortModel.delete(key, (err, result) => {
                            // Return data
                            if (err) {
                                res.status(500).json({ success: false, msg: err });
                                return;
                            }
                            res.json({ success: true, msg: "Cohort deleted" });
                        });
                    }
                });
            } else {
                CohortModel.delete(key, (err, result) => {
                    // Return data
                    if (err) {
                        res.status(500).json({ success: false, msg: err });
                        return;
                    }
                    res.json({ success: true, msg: "Cohort deleted" });
                });
            }
        });
    }
);

module.exports = router;
