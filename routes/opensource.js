// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Views = require("../models/opensourceviews");

/**
 * @swagger
 * tags:
 *   name: OpenSource
 *   description: Queries for checking Open Source information
 */

/**
 * @swagger
 * /opensource/getByPage:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get List of Page views
 *     tags:
 *      - OpenSource
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: page
 *         description: Name of Page
 *         in: formData
 *         required: true
 *         type: string
 *       - name: limit
 *         description: Max number of search results
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Open Source Audit List
 */
router.post(
    "/getByPage",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const page = req.body.page;
        const limit = parseInt(req.body.limit) || 100;
        Views.getByPage(page, limit, function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send("[]");
                }
            }
        });
    }
);

/**
 * @swagger
 * /opensource/addView:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Adds a Page view
 *     tags:
 *      - OpenSource
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: page
 *         description: Page viewed
 *         in: formData
 *         required: true
 *         type: string
 *       - name: parent
 *         description: URL of Parent container
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation that view recorded
 */
router.post("/addView", (req, res, next) => {
    const page = req.body.page;
    const forwarded = req.headers["x-forwarded-for"] || "";
    const ipaddress = forwarded.toString().split(",").pop() || req.connection.remoteAddress || req.socket.remoteAddress;
    const parent = req.body.parent;
    const newView = {
        page: { S: page },
        datetime: { S: new Date().toUTCString() },
        ipaddress: { S: ipaddress },
        parent: { S: parent },
    };
    Views.addView(newView, function (err, result) {
        if (err) {
            res.status(503).send({ status: 503, msg: err });
        } else {
            res.send({ status: 200, msg: "View Recorded" });
        }
    });
});

module.exports = router;
