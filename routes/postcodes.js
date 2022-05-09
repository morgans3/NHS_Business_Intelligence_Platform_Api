// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const pool = require("../config/database").pool;

/**
 * @swagger
 * tags:
 *   name: PostCodes
 *   description: Post Codes
 */

/**
 * @swagger
 *  /postcodes/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - PostCodes
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
        const pcgeoquery = `SELECT
        'FeatureCollection' AS TYPE,
        array_to_json(array_agg(f)) AS features
    FROM (
        SELECT
            'Feature' AS TYPE,
            ST_AsGeoJSON (ST_Simplify (lg.geom, 0.0001, TRUE), 4)::json AS geometry,
            row_to_json(row(mostype, pop), true) AS properties
        FROM
            mosaicpostcode AS lg)
    AS f`;
        pool.query(pcgeoquery, (error, results) => {
            if (error) {
                res.json("Error: " + error);
            }
            if (results.rows) {
                res.status(200).json(results.rows);
            } else {
                res.status(200).json([]);
            }
        });
    }
);

module.exports = router;
