// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { settings } = require("../config/database");
const PostgresI = require("diu-data-functions").Methods.Postgresql;
const PGConstruct = PostgresI.init(settings);
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: HouseholdIsochrone
 *   description: Query to Accept Isochrone Bounds and Return Households Within
 */

/**
 * @swagger
 * /isochrone/houses-within-isochrone:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get Isochrone Household List
 *     tags:
 *      - HouseholdIsochrone
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: isochrone_bounds
 *         description: Isochrone bounds within which to search
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Household Statistics
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/houses-within-isochrone",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            isochrone_bounds: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        PostgresI.getIsoChrone(PGConstruct, { query: req.body.isochrone_bounds }, (err, response) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send(response);
        });
    }
);

module.exports = router;
