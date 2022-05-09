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
 */
router.post(
    "/evidencesearch",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        GetNICE(req.body.search_query, req.body.search_length, (error, response, body) => {
            if (error) {
                res.json({
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
