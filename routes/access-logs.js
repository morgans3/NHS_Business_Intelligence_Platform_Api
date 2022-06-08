// @ts-check
const express = require("express");
const router = express.Router();
const JWT = require("jsonwebtoken");
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const AccessLogModel = new DIULibrary.Models.AccessLog();
const momentLib = require("moment");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: AccessLogs
 *   description: Access log Methods
 */

/**
 * @swagger
 * /access-logs:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get access logs. Requires Hall Monitor or Inspection
 *     tags:
 *      - AccessLogs
 *     parameters:
 *      - name: date
 *        description: Date to filter by, defaults to current
 *        in: query
 *        type: string
 *        format: date
 *      - name: type
 *        description: Type to filter by
 *        in: query
 *        type: string
 *      - name: pageKey
 *        description: Start page from item with this key
 *        in: query
 *        type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of access logs
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/access-logs",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability(["Hall Monitor", "Inspection"]),
    ],
    (req, res, next) => {
        // Set callback
        const callback = (error, data) => {
            // Check for error
            if (error) {
                res.status(500).json({ success: false, msg: error });
                return;
            }
            if (data.Items) {
                res.json(data.Items);
            } else {
                // Return list
                res.json(data);
            }
        };

        // Change method depending on query
        if (req.query.type) {
            AccessLogModel.getByType(req.query, callback);
        } else {
            AccessLogModel.getByDate(req.query, callback);
        }
    }
);

/**
 * @swagger
 * /{user}/access-logs:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get access logs by username. Requires Hall Monitor or Inspection
 *     tags:
 *      - AccessLogs
 *     parameters:
 *      - name: user
 *        description: Filter by username
 *        in: path
 *        type: string
 *        required: true
 *      - name: date
 *        description: Date to filter by, defaults to current
 *        in: query
 *        type: string
 *        format: date
 *      - name: pageKey
 *        description: Start page from item with this key
 *        in: query
 *        type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of access logs
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       404:
 *        description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/:user/access-logs",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability(["Hall Monitor", "Inspection"]),
    ],
    (req, res, next) => {
        AccessLogModel.getByUser(Object.assign({}, req.params, req.query), (error, data) => {
            // Check for error
            if (error) {
                res.status(500).json({ success: false, msg: error });
                return;
            }

            if (data.Items && data.Items.length > 0) {
                res.json(data.Items);
            } else {
                // Return list
                res.status(404).json({ success: false, msg: "We cannot find any logs associated to this user" });
            }
        });
    }
);

/**
 * @swagger
 * /access-logs/statistics:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get access log statistics. Requires Hall Monitor or Inspection
 *     tags:
 *      - AccessLogs
 *     parameters:
 *      - name: date_from
 *        description: Date to get the statistics from
 *        in: query
 *        type: string
 *        format: date
 *      - name: date_to
 *        description: Date to get the statistics to
 *        in: query
 *        type: string
 *        format: date
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of access log statistics grouped by day
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/access-logs/statistics",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability(["Hall Monitor", "Inspection"]),
    ],
    MiddlewareHelper.validate(
        "query",
        {
            date_from: { type: "string" },
            date_to: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const dateFrom = req.query.date_from.toString();
        const dateTo = req.query.date_to.toString();
        if (!dateFrom || !dateTo) {
            res.status(400).json({ success: false, msg: "Missing input params" });
            return;
        }
        // Get days between
        // @ts-ignore
        const daysBetween = Math.round(Math.abs((new Date(dateFrom) - new Date(dateTo)) / 86400000));

        // Group by?
        req.query.groupBy = daysBetween > 70 ? "month" : daysBetween > 32 ? "week" : "date";

        // Get data
        new DIULibrary.Models.AccessLogStatistic().getByDateRange(req.query, (err, statistics) => {
            // Error occurred with query
            if (err) {
                res.status(500).json({ success: false, msg: err });
                return;
            }

            // Get time period list
            const periods = [];
            const dateFromMoment = momentLib(dateFrom);
            const dateToMoment = momentLib(dateTo);
            if (req.query.groupBy === "month") {
                while (dateToMoment > dateFromMoment || dateFromMoment.format("M") === dateToMoment.format("M")) {
                    periods.push(dateFromMoment.startOf("month").format("YYYY-MM-DD"));
                    dateFromMoment.add(1, "month");
                }
            } else if (req.query.groupBy === "week") {
                while (dateToMoment > dateFromMoment || dateFromMoment.format("W") === dateToMoment.format("W")) {
                    periods.push(dateFromMoment.startOf("isoWeek").format("YYYY-MM-DD"));
                    dateFromMoment.add(1, "week");
                }
            } else {
                while (dateToMoment > dateFromMoment || dateFromMoment.format("D") === dateToMoment.format("D")) {
                    periods.push(dateFromMoment.format("YYYY-MM-DD"));
                    dateFromMoment.add(1, "day");
                }
            }

            // Get data for each period
            const groupBy = require("lodash/groupBy");
            const response = { periods, data: [] };

            // Reformat dates
            statistics = statistics.map((stat) => {
                stat.date = stat.date.toISOString().slice(0, 10);
                return stat;
            });

            // Loop through each type
            Object.keys(groupBy(statistics, (stat) => stat.type)).forEach((type) => {
                // Get by type group by date
                const typeStatistics = groupBy(
                    statistics.filter((stat) => stat.type === type),
                    (stat) => stat.date
                );

                // Add data to array
                const data = { name: type, statistics: [] };
                periods.forEach((period) => {
                    if (typeStatistics[period] && typeStatistics[period].length > 0) {
                        data.statistics.push(parseInt(typeStatistics[period][0].total));
                    } else {
                        data.statistics.push(0);
                    }
                });
                response.data.push(data);
            });

            // Return data
            res.json(response);
        });
    }
);

/**
 * @swagger
 * /access-logs/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create an access log for the authenticated user
 *     tags:
 *      - AccessLogs
 *     parameters:
 *       - name: type
 *         description: The log type, i.e. Login, Capability
 *         in: formData
 *         required: true
 *         type: string
 *       - name: data
 *         description: Metatdata to store along with the log
 *         in: formData
 *         required: false
 *         type: object
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Access log created
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/access-logs/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            type: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Read jtw
        const user = req.header("authorization");
        const decodedToken = JWT.decode(user.replace("JWT ", ""));

        // Store access log
        const payload = req.body;
        AccessLogModel.create(
            {
                type: payload.type,
                user: {
                    username: decodedToken["username"],
                    organisation: decodedToken["organisation"],
                },
                data: payload.data || {},
            },
            (err, data) => {
                // Return status
                if (err) {
                    res.status(500).json({ status: 500, error: err });
                } else {
                    res.json({ status: 200, msg: "Log stored successfully", data });
                }
            }
        );
    }
);

module.exports = router;
