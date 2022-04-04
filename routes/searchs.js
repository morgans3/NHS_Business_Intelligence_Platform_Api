// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Teams = require("../models/teamprofiles");

/**
 * @swagger
 * tags:
 *   name: SearchTeams
 *   description: Search for teams of the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /searchs/searchTeams?searchterm={searchterm}:
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
 *     responses:
 *       200:
 *         description: Search Results
 */
router.get(
  "/searchTeams",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const search = req.query.searchterm;
    Teams.getTeamsByPartialTeamName(search, function (err, teams) {
      res.send(JSON.stringify(teams.Items));
    });
  }
);

module.exports = router;
