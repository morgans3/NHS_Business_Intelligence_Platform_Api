// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const pool = require("../config/database").pool;

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
    const pcgeoquery = `SELECT 'FeatureCollection' AS TYPE, array_to_json(array_agg(f)) AS features FROM ( SELECT 'Feature' AS TYPE, ST_AsGeoJSON (lg.geom, 4)::json AS geometry, row_to_json(row(id, "time", lat, lng, tme, optim_var), true) AS properties FROM public.isochrone_outbreak AS lg) AS f`;
    pool.query(pcgeoquery, (error, results) => {
      if (error) res.json("Error: " + error);
      if (results.rows) {
        res.status(200).json(results.rows);
      } else {
        res.status(200).json([]);
      }
    });
  }
);

module.exports = router;
