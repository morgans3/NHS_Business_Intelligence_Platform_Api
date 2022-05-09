// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const outbreak = require("../models/outbreak");

/**
 * @swagger
 * tags:
 *   name: Outbreak
 *   description: Outbreak Map Information
 */

/**
 * @swagger
 * /outbreak/mapinfo:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Outbreak
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/mapinfo",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        outbreak.getOutbreak((error, results) => {
            if (error) res.status(500).json("Error: " + error);
            if (results.rows) {
                res.status(200).json(results.rows);
            } else {
                res.status(200).json([]);
            }
        });
    }
);

module.exports = router;
