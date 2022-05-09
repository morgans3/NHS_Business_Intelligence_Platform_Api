// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const ClinicalTrialModel = new DIULibrary.Models.ClinicalTrialModel();

/**
 * @swagger
 * tags:
 *   name: AACT
 *   description: Queries for AACT Clinical Trials Database
 */

/**
 * @swagger
 * /trials/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get Clinical Trials List
 *     tags:
 *      - AACT
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Clinical Trials List
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        ClinicalTrialModel.get(function (err, result) {
            if (err) {
                res.send({ success: false, msg: err });
            } else {
                if (result.rows) {
                    res.send(JSON.stringify(result.rows));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

/**
 * @swagger
 * /trials/getSearchTop1000:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Clinical Trials List
 *     tags:
 *      - AACT
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: search
 *         description: Search Parameters
 *         in: formData
 *         required: true
 *         type: string
 *       - name: phases
 *         description: phase Parameters
 *         in: formData
 *         required: true
 *         type: string
 *       - name: min_date
 *         description: min_date Parameters
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Clinical Trials List
 */
router.post(
    "/getSearchTop1000",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const query = req.body.search;
        const phases = req.body.phases;
        const minDate = req.body.minDate;
        ClinicalTrialModel.getSearchTop1000(query, phases, minDate, function (err, result) {
            if (err) {
                res.send({ success: false, msg: err });
            } else {
                if (result.rows) {
                    res.send(JSON.stringify(result.rows));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

module.exports = router;
