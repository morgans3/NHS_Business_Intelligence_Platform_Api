// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DynamoDBData = require("diu-data-functions").Methods.DynamoDBData;
const { settings } = require("../config/database");
const PostgresI = require("diu-data-functions").Methods.Postgresql;
const PGConstruct = PostgresI.init(settings);

/**
 * @swagger
 * tags:
 *   name: Mosaic
 *   description: Methods for storing information on the Mosaic Dataset provided by Experian
 */

/**
 * @swagger
 * /mosaic/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get all Information
 *     tags:
 *      - Mosaic
 *     parameters:
 *       - name: postcode
 *         description: Post Code
 *         in: query
 *         type: string
 *         example: FY3 8NP
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: All data
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
        // Get all mosaics
        const getMosaics = () => {
            DynamoDBData.getAll(AWS, "mosaics", (err, result) => {
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                } else {
                    res.json(result.Items);
                }
            });
        };

        // Get mosaics by postcode
        const getMosaicsByPostcode = () => {
            const postcode = req.query.postcode;
            res.type("application/json");
            if (postcode === undefined || postcode === null) {
                res.status(400).json({ success: false, msg: "Incorrect Parameters" });
            } else {
                const query = `SELECT mostype FROM public.mosaicpostcode where postcode = '${postcode}'`;
                PostgresI.getByQuery(PGConstruct, query, (err, response) => {
                    if (err) {
                        res.status(500).json({ success: false, msg: err });
                    } else {
                        res.json(response);
                    }
                });
            }
        };

        if (req.query.postcode) {
            getMosaicsByPostcode();
        } else {
            getMosaics();
        }
    }
);

module.exports = router;
