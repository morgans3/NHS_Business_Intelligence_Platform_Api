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
 * /mosaic/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get all Information
 *     tags:
 *      - Mosaic
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: All data
 */
router.get(
  "/getAll",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    DynamoDBData.getAll(AWS, "mosaics", (err, result) => {
      if (err) {
        res.status(500).json({ success: false, msg: err });
      } else {
        res.json(result.Items);
      }
    });
  }
);

/**
 * @swagger
 * /mosaic/getCodefromPostCode?postcode={postcode}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Provides Mosaic code from the provided post code
 *     tags:
 *      - Mosaic
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: postcode
 *         description: Post Code
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Mosaic Code
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing
 */
router.get(
  "/getCodefromPostCode",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
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
  }
);

module.exports = router;
