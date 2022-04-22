// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");

const DynamoDBData = require("diu-data-functions").Methods.DynamoDBData;

/**
 * @swagger
 * tags:
 *   name: Payloads
 *   description: Methods for generating and retrieving stored JSON configurations
 */

/**
 * @swagger
 * /payloads/{id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get a single role by id
 *     tags:
 *      - Payloads
 *     parameters:
 *       - name: id
 *         description: Payload id
 *         in: path
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The Payload
 */
router.get(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    DynamoDBData.getItemByKey(AWS, "atomic_payload", "id", req.params.id, (err, result) => {
      if (err) {
        res.status(500).json({ success: false, msg: err });
      } else {
        res.json(result.items);
      }
    });
  }
);

module.exports = router;
