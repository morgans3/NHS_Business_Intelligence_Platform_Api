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
 * /orgboundaries/topo-json:
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/topo-json",
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
        PostgresI.getGeoJson(PGConstruct, params, (err, response) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                res.json(response);
            }
        });
    }
);

module.exports = router;
