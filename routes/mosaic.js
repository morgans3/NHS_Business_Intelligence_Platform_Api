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
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: All data
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
                PostgresI.getByQuery(PGConstruct, query, (response) => {
                    res.json(response);
                });
            }
        };

        // Determine method?
        if (req.query.postcode) {
            getMosaicsByPostcode();
        } else {
            getMosaics();
        }
    }
);

module.exports = router;
