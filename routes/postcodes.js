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
                res.status(500).json("Error: " + error);
            }
            if (results.rows) {
                res.json(results.rows);
            } else {
                res.json("[]");
            }
        });
    }
);

/**
 * @swagger
 *  /postcodes/postcode-lookup/:
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
    "/postcode-lookup",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        postcodes.getPostcodeLookups((error, results) => {
            if (error) {
                res.status(500).json("Error: " + error);
            } else {
                res.json(results);
            }
        });
    }
);

module.exports = router;
