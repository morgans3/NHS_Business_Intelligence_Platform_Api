// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const GrandIndex = require("../models/grandindex");

/**
 * @swagger
 * tags:
 *   name: GrandIndex
 *   description: Grand Index
 */

/**
 * @swagger
 * /grandindex/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - GrandIndex
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
    GrandIndex.getAll(function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.rows) {
          res.send(JSON.stringify(result.rows));
        } else {
          res.send("[]");
        }
      }
    });
  }
);

module.exports = router;
