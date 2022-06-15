// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const shielding = require("../models/shielding");
const JWT = require("jsonwebtoken");
const { sanitiseQueryLimit } = require("../helpers/routes");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: ShieldingList
 *   description: NSSS List functions
 */

/**
 * @swagger
 * /shielding/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Gets a list of citizens enrolled on the National Shielding Service System. Requires populationshielding
 *     tags:
 *      - ShieldingList
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: Limit
 *         description: Limit of citizens returned to a maximum of 5000
 *         in: query
 *         type: string
 *         example: 10
 *     responses:
 *       200:
 *         description: Shielding List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised
 *       403:
 *        description: Forbidden due to capability requirements
 *       404:
 *        description: Not Found
 *       500:
 *         description: Server Error Processing
 */
router.get(
    "/",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("populationshielding"),
    ],
    (req, res, next) => {
        const limit = sanitiseQueryLimit(req.query.Limit);
        res.type("application/json");
        const jwt = req.header("authorization");
        if (jwt) {
            const decodedToken = JWT.decode(jwt.replace("JWT ", ""));
            const userroles = decodedToken["capabilities"];
            shielding.getAll(limit, userroles, function (access, err, result) {
                if (err) {
                    res.status(500).send(
                        JSON.stringify({
                            reason: "Error: " + err,
                        })
                    );
                } else if (access) {
                    res.status(401).send(result);
                } else {
                    if (result.length > 0) {
                        res.send(JSON.stringify(result));
                    } else {
                        res.status(404).send(
                            JSON.stringify({
                                reason: "Unable to find any citizens, may not exist or have insufficient permissions to view record.",
                            })
                        );
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        }
    }
);

module.exports = router;
