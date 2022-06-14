// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const RealTimeSurveillance = new DIULibrary.Models.RealTimeSurveillance();

/**
 * @swagger
 * tags:
 *   name: Real Time Surveillance
 *   description: SPI Incidents
 */

/**
 * @swagger
 * /real_time_surveillance:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Real Time Surveillance
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
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
        RealTimeSurveillance.get((err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send(result.Items);
        });
    }
);

module.exports = router;
