// @ts-check
const express = require("express");
const router = express.Router();
const { settings } = require("../config/database");
const PostgresI = require("diu-data-functions").Methods.Postgresql;
const PGConstruct = PostgresI.init(settings);

/**
 * @swagger
 * tags:
 *   name: GPPractices
 *   description: Feature Collection of GP Practices
 */

/**
 * @swagger
 * /gppractices/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - GPPractices
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */

router.get("/getAll", (req, res, next) => {
  const params = {
    tablename: "public.gps",
    st_asgeojson: "ST_Simplify (lg.geom, 0.0001, TRUE)",
    as_properties: `(select row_to_json(_) AS properties from (select lg.organisation_code AS "Code",
        lg.name AS "Name",
        ST_X(lg.geom) AS "Long",
        ST_Y(lg.geom) AS "Lat") as _)
  --row_to_json((organisation_code, name), true) AS properties`,
    whereclause: "WHERE lg.ccg in ('00Q', '00R', '00X', '01A', '01E', '01K', '02G', '02M') AND (LEFT(lg.organisation_code,1) != 'Y') OR lg.organisation_code='Y01008'",
  };
  PostgresI.getGeoJson(PGConstruct, params, (response) => {
    res.json(response);
  });
});

module.exports = router;
