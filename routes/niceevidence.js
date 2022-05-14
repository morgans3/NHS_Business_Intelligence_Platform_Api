// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Request = require("request");

// Put NICE api path here
const basePath = "https://api.nice.org.uk/services/search/results?q=";

/**
 * @swagger
 * tags:
 *   name: NICEEvidenceSearch
 *   description: NICE Evidence Search API
 */

function GetNICE(path, paramItems, callback) {
    const items = typeof paramItems === "undefined" ? 100 : paramItems;
    Request.get(
        {
            headers: {
                "API-Key": process.env.NICEAPI_KEY,
                Accept: "application/vnd.nice.syndication.search+json;version=1.0",
            },
            url: basePath + path + "&ps=" + items,
        },
        (error, response, body) => {
            if (response.statusCode === 200) {
                callback(error, response, body);
            } else if (response.statusCode === 401) {
                callback(new Error("401: "), response, null);
            } else {
                callback(response.statusCode, response, null);
            }
        }
    );
}

/**
 * @swagger
 * /niceevidence/evidencesearch:
 *   post:
 *     security:
 *      - JWT: []
 *     tags:
 *      - NICEEvidenceSearch
 *     parameters:
 *       - name: search_query
 *         description: Query to search NICE Evidence
 *         in: formData
 *         required: true
 *         type: string
 *       - name: search_length
 *         description: Choose how many items to return
 *         in: formData
 *         required: false
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: JSON containing response from NICE API
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/evidencesearch",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.search_query || !req.body.search_length) {
            res.status(400).send({ success: false, msg: "Bad Request" });
            return;
        }
        GetNICE(req.body.search_query, req.body.search_length, (error, response, body) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + error,
                });
            } else {
                res.send({
                    success: true,
                    msg: body,
                });
            }
        });
    }
);

module.exports = router;
