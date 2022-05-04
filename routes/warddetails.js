// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DynamoDBData = require("diu-data-functions").Methods.DynamoDBData;

/**
 * @swagger
 * tags:
 *   name: WardDetails
 *   description: Methods for Electoral Ward information
 */

/**
 * @swagger
 * /warddetails/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get all Ward Information
 *     tags:
 *      - WardDetails
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
    DynamoDBData.getAll(AWS, "warddetails", (err, result) => {
      if (err) {
        res.status(500).json({ success: false, msg: err });
      } else {
        res.json(result.Items);
      }
    });
  }
);

module.exports = router;
