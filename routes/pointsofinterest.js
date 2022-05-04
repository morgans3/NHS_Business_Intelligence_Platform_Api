// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DynamoDBData = require("diu-data-functions").Methods.DynamoDBData;

/**
 * @swagger
 * tags:
 *   name: PointsOfInterest
 *   description: Methods for storing data on interesting places or geographical locations
 */

/**
 * @swagger
 * /pointsofinterest/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get all Information
 *     tags:
 *      - PointsOfInterest
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
    DynamoDBData.getAll(AWS, "pointsofinterests", (err, result) => {
      if (err) {
        res.status(500).json({ success: false, msg: err });
      } else {
        res.json(result.Items);
      }
    });
  }
);

module.exports = router;
