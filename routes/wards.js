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
 *   name: Wards
 *   description: Feature Collection of Wards
 */

/**
 * @swagger
 * /wards/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Wards
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
        const params = {
            tablename: "public.wards",
            st_asgeojson: "ST_Simplify (lg.geom, 0.0001, TRUE)",
            as_properties: `(select row_to_json(_) AS properties from (select st_areasha,
        st_lengths,
        objectid,
        lad15nm,
        lad15cd,
        wd15nmw,
        wd15nm,
        wd15cd) as _)
--row_to_json((organisation_code, name), true) AS properties`,
        };
        PostgresI.getGeoJson(PGConstruct, params, (response) => {
            res.json(response);
        });
    }
);

module.exports = router;
