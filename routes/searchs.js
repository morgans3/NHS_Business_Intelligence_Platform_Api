// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const TeamModel = new DIULibrary.Models.TeamModel();

/**
 * @swagger
 * tags:
 *   name: SearchTeams
 *   description: Search for teams of the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /searchs/teams:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SearchTeams
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: searchterm
 *         description: Search Term
 *         in: query
 *         required: true
 *         type: string
 *         example: DIU
 *     responses:
 *       200:
 *         description: Search Results
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/teams",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "query",
        {
            searchterm: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        TeamModel.getByFilters(
            {
                name: req.query.searchterm,
            },
            (err, teams) => {
                if (err) {
                    res.status(500).send({ status: 500, message: err });
                } else {
                    res.send(JSON.stringify(teams.Items));
                }
            }
        );
    }
);

module.exports = router;
