// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");

const DIULibrary = require("diu-data-functions");
const CVICohortModel = new DIULibrary.Models.CVICohortModel();

/**
 * @swagger
 * tags:
 *   name: CVICohorts
 *   description: CVICohorts on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /cvicohorts:
 *   get:
 *     description: Get a list of cohorts
 *     security:
 *      - JWT: []
 *     tags:
 *      - CVICohorts
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
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        CVICohortModel.get(req.query, (err, result) => {
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
 * /cvicohorts/create:
 *   post:
 *     description: Create a new cohort
 *     security:
 *      - JWT: []
 *     tags:
 *      - CVICohorts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: cohortName
 *         description: Cohort name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: createdDT
 *         description: Created at timestamp
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
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        CVICohortModel.create(
            {
                cohortName: req.body.cohortName,
                createdDT: req.body.createdDT,
                cohorturl: req.body.cohorturl,
                teamcode: req.body.teamcode,
                username: req.body.username,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: false, msg: "New cohort created!", data });
            }
        );
    }
);

/**
 * @swagger
 * /cvicohorts/update:
 *   post:
 *     description: Create a new cohort
 *     security:
 *      - JWT: []
 *     tags:
 *      - CVICohorts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: cohortName
 *         description: Cohort name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: createdDT
 *         description: Created at timestamp
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
 */
router.post(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // TODO: check if user is allowed to update team if teamcode included
        CVICohortModel.update(
            {
                cohortName: req.body.cohortName,
                createdDT: req.body.createdDT,
            },
            {
                cohorturl: req.body.cohorturl,
                teamcode: req.body.teamcode,
                username: req.body.username,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: false, msg: "Cohort updated!", data });
            }
        );
    }
);

/**
 * @swagger
 * /cvicohorts/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a cohort
 *     tags:
 *      - CVICohorts
 *     parameters:
 *       - name: cohortName
 *         description: Cohort name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: createdDT
 *         description: Created at timestamp
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // TODO: check if user is allowed to update team if teamcode included
        CVICohortModel.delete(
            {
                cohortName: req.body.cohortName,
                createdDT: req.body.createdDT,
            },
            (err, result) => {
                // Return data
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                    return;
                }
                res.json({ success: true, msg: "Cohort deleted!" });
            }
        );
    }
);

module.exports = router;
