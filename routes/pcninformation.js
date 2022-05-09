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
 * /pcninformation/getTopoJSON:
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

/**
 * @swagger
 * /pcninformation/getData:
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
 */
router.get(
    "/getData",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        PostgresI.getAll(PGConstruct, "public.mosaicpcn", (response) => {
            res.json(response);
        });
    }
);

/**
 * @swagger
 * /pcninformation/getHexGeojson:
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
 */
router.get(
    "/getHexGeojson",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const params = {
            tablename: "public.pcn_hex_geo",
            st_asgeojson: "lg.geom",
            as_properties: "(select row_to_json(_) AS properties from (select id, pcn) as _)",
        };
        PostgresI.getGeoJson(PGConstruct, params, (response) => {
            res.json(response);
        });
    }
);

module.exports = router;
