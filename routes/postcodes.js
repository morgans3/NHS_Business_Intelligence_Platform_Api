// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const postcodes = require("../models/postcodes");

/**
 * @swagger
 * tags:
 *   name: PostCodes
 *   description: Post Codes
 */

/**
 * @swagger
 *  /postcodes/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - PostCodes
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
        postcodes.getPostcodes((error, results) => {
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
