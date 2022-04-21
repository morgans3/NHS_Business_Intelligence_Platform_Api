// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { settings } = require("../config/database");
const PostgresI = require("diu-data-functions").Methods.Postgresql;
const PGConstruct = PostgresI.init(settings);

/**
 * @swagger
 * tags:
 *   name: Boundaries
 *   description: Feature Collection of Boundaries
 */

/**
 * @swagger
 * /orgboundaries/getTopoJSON:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Boundaries
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getTopoJSON",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const params = {
      tablename: "public.icps",
      st_asgeojson: "ST_Simplify (lg.geom, 0.0001, TRUE)",
      as_properties: `(select row_to_json(_) AS properties from (select lg.icp AS "ICP") as _)
      --row_to_json((organisation_code, name), true) AS properties`,
    };
    PostgresI.getGeoJson(PGConstruct, params, (response) => {
      res.json(response);
    });
  }
);

module.exports = router;
