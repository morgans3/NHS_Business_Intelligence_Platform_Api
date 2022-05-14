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
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/getByPage",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.page || !req.body.limit) {
            res.status(400).json({ success: false, msg: "Incorrect Parameters" });
            return;
        }
        const limit = parseInt(req.body.limit) || 100;
        Views.getByPage(req.body.page, limit, function (err, result) {
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
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post("/addView", (req, res, next) => {
    if (!req.body.page || !req.body.parent) {
        res.status(400).json({ success: false, msg: "Incorrect Parameters" });
        return;
    }
    const page = req.body.page;
    const forwarded = req.headers["x-forwarded-for"] || "";
    const ipaddress = forwarded.toString().split(",").pop() || req.connection.remoteAddress || req.socket.remoteAddress;
    const parent = req.body.parent;

    Views.addView(
        {
            page,
            datetime: new Date().toUTCString(),
            ipaddress,
            parent,
        },
        function (err, data) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                res.send({ success: true, msg: "View Recorded", data });
            }
        }
    );
});

module.exports = router;
