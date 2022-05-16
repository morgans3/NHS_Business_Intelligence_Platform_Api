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
 *   name: PCNInformation
 *   description: Collections of PCN Information
 */

/**
 * @swagger
 * /pcninformation/topo-json:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - PCNInformation
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
                return;
            }
            res.send(response);
        });
    }
);

/**
 * @swagger
 * /pcninformation/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - PCNInformation
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
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        PostgresI.getAll(PGConstruct, "public.mosaicpcn", (err, response) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send(response);
        });
    }
);

/**
 * @swagger
 * /pcninformation/hexgeo-json:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - PCNInformation
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
    "/hexgeo-json",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const params = {
            tablename: "public.pcn_hex_geo",
            st_asgeojson: "lg.geom",
            as_properties: "(select row_to_json(_) AS properties from (select id, pcn) as _)",
        };
        PostgresI.getGeoJson(PGConstruct, params, (err, response) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send(response);
        });
    }
);

module.exports = router;
