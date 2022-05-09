// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");

const DIULibrary = require("diu-data-functions");
const CohortModel = new DIULibrary.Models.CohortModel();

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
 */
router.get("/", passport.authenticate("jwt", {
    session: false,
}), (req, res, next) => {
    CohortModel.get(req.query, (err, result) => {
        if (err) { res.status(500).send({ success: false, msg: err }); return; }
        res.send(result.Items);
    });
});

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
 */
router.post("/create", passport.authenticate("jwt", {
    session: false,
}), (req, res, next) => {
    CohortModel.create({
        cohortName: req.body.cohortName,
        cohorturl: req.body.cohorturl,
        teamcode: req.body.teamcode,
        user: req.body.username
    }, (err, result) => {
        if (err) { res.status(500).send({ success: false, msg: err }); return; }
        res.send({ success: false, msg: "New cohort created!" });
    });
});


/**
 * @swagger
 * /cohorts/update:
 *   post:
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
 */
router.post("/update", passport.authenticate("jwt", {
    session: false,
}), (req, res, next) => {
    CohortModel.update({
        _id: req.body.id
    }, {
        cohortName: req.body.cohortName,
        cohorturl: req.body.cohorturl,
        teamcode: req.body.teamcode,
        user: req.body.username
    }, (err, result) => {
        if (err) { res.status(500).send({ success: false, msg: err }); return; }
        res.send({ success: false, msg: "Cohort updated!" });
    });
});

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
 */
router.delete("/delete", passport.authenticate("jwt", {
    session: false,
}), (req, res, next) => {
    // Delete cohort by id
    CohortModel.delete({
        _id: req.body.id
    }, (err, result) => {
        // Return data
        if (err) {
            res.status(500).json({ success: false, msg: err });
            return;
        }
        res.json({ success: true, msg: "Cohort deleted!" });
    });
}
);

module.exports = router;
