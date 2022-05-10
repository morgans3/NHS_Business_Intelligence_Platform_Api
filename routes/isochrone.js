// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { settings } = require("../config/database");
const PostgresI = require("diu-data-functions").Methods.Postgresql;
const PGConstruct = PostgresI.init(settings);

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
 */
router.post(
    "/houses-within-isochrone",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const query = req.body.isochrone_bounds;
        const params = {
            query,
        };
        PostgresI.getIsoChrone(PGConstruct, params, (response) => {
            res.json(response);
        });
    }
);

module.exports = router;
