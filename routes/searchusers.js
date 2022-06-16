// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const UserModel = new DIULibrary.Models.UserModel();
const OrganisationModel = new DIULibrary.Models.OrganisationModel();
const ADModel = require("../models/activedirectory");
const ActiveDirectoryModel = new ADModel();
const StringHelper = DIULibrary.Helpers.StringMethods;

/**
 * @swagger
 * tags:
 *   name: SearchUsers
 *   description: Search for users of the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /searchusers/profiles:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SearchUsers
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
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *       503:
 *        description: Service Unavailable
 */
router.get(
    "/profiles",
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
        const search = req.query.searchterm;
        const searchresults = [];
        UserModel.getUserByPartialUsername(search, function (err, users) {
            if (err) {
                console.log("ERROR: " + JSON.stringify(err));
                res.status(503).send({ status: 503, message: "Organisation service not available" });
            } else {
                const response = [];
                users.Items.forEach((element) => {
                    response.push({
                        name: element.name,
                        email: element.email,
                        username: element.username,
                    });
                });
                searchresults.push({
                    name: "Collaborative Partners",
                    results: response,
                });
                res.send(searchresults);
            }
        });
    }
);

/**
 * @swagger
 * /searchusers/org-profiles:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SearchUsers
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: searchterm
 *         description: Search Term
 *         in: query
 *         required: true
 *         type: string
 *       - name: organisation
 *         description: Search Organisation
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Search Results
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *       503:
 *        description: Service Unavailable
 */
router.get(
    "/org-profiles",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "query",
        {
            searchterm: { type: "string" },
            organisation: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const search = req.query.searchterm;
        const organisation = req.query.organisation;
        const searchresults = [];
        const personquery = "(&(|(objectClass=user)(objectClass=person))(!(objectClass=computer))(!(objectClass=group)))";
        const emailquery = "(|(mail=" + search + "*)(displayName=" + search + "*)(cn=" + search + "*)(sAMAccountName=" + search + "*))";
        const fullquery = "(&" + emailquery + personquery + ")";
        switch (organisation) {
            case "Demo":
            case "Collaborative Partners":
            case "Admin":
                UserModel.getUserByPartialUsername(search, function (err, users) {
                    if (err) {
                        console.log("ERROR: " + JSON.stringify(err));
                        res.status(503).send({ status: 503, message: "Organisation service not available" });
                    } else {
                        const response = [];
                        users.Items.forEach((element) => {
                            response.push({
                                name: element.name,
                                email: element.email,
                                username: element.username,
                                organisation: element.organisation,
                                linemanager: element.linemanager,
                            });
                        });
                        searchresults.push({
                            name: organisation,
                            results: response,
                        });
                        res.send(searchresults);
                    }
                });
                break;
            default:
                OrganisationModel.get({ name: organisation }, (err, data) => {
                    // Handle error
                    if (err) {
                        res.status(500).send({ status: 500, message: err });
                        return;
                    }

                    // Organisation exists?
                    if (data.Items.length === 0) {
                        res.status(404).send({ status: 404, message: "Organisation not found" });
                        return;
                    }

                    // Query via active directory
                    const selOrganisation = data.Items[0];
                    ActiveDirectoryModel.getInstance(selOrganisation.authmethod, (errGetInstance, activeDirectory) => {
                        // Handle error type?
                        if (errGetInstance) {
                            res.status(500).send({ status: 500, message: errGetInstance });
                            return;
                        }

                        // Find users
                        activeDirectory.findUsers(fullquery, function (errFind, user) {
                            if (errFind) {
                                console.log("ERROR: " + JSON.stringify(errFind));
                                res.status(503).send({ status: 503, message: "Organisation service not available" });
                            } else {
                                if (user && user.length > 0) {
                                    const responseAD = [];
                                    user.forEach((staff) => {
                                        responseAD.push({
                                            id: StringHelper.sidBufferToString(staff.objectSid),
                                            name: staff.cn,
                                            email: staff.mail,
                                            username: staff.sAMAccountName,
                                        });
                                    });
                                    searchresults.push({
                                        name: selOrganisation.name,
                                        results: responseAD,
                                    });
                                }
                                res.send(searchresults);
                            }
                        });
                    });
                });
                break;
        }
    }
);

module.exports = router;
