// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const pool = require("../config/database").pool;

/**
 * @swagger
 * tags:
 *   name: Pcninformation
 *   description: Pcn information
 */

/**
 * @swagger
 *  /pcninformation/getData:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Pcninformation
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
    const pcgeoquery = `SELECT * FROM public.public.mosaicpcn`;
    pool.query(pcgeoquery, (error, results) => {
      if (error) {
        res.json("Error: " + error);
      }
      if (results.rows) {
        res.status(200).json(results.rows);
      } else {
        res.status(200).json([]);
      }
    });
  }
);

module.exports = router;
