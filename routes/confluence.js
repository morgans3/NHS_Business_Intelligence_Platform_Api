// @ts-check

const express = require("express");
const router = express.Router();
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const ConfluenceModel = new DIULibrary.Models.ConfluenceModel();

/**
 * @swagger
 * tags:
 *   name: Confluence
 *   description: Methods for confluence api
 */

/**
 * @swagger
 * /confluence/content/search:
 *   get:
 *     description: Search user guides on confluence
 *     tags:
 *      - Confluence
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: keyword
 *        description: Search guides by keyword
 *        type: string
 *        in: query
 *        example: Nexus
 *     responses:
 *       200:
 *         description: Full list of guides
 *       500:
 *         description: Internal Server Error
 */
router.get("/content/search", (req, res, next) => {
    ConfluenceModel.searchContent(req.query, (data) => {
        if (data) {
            res.json(data);
        } else {
            res.status(500).json({ message: "An error occurred fetching the content" });
        }
    });
});

/**
 * @swagger
 * /confluence/content/{id}:
 *   get:
 *     description: Get content for a guide by it's id
 *     tags:
 *      - Confluence
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: id
 *        description: Confluence content id
 *        type: string
 *        in: path
 *        example: 424050693
 *     responses:
 *       200:
 *         description: Confluence document
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/content/:id",
    MiddlewareHelper.validate(
        "params",
        {
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        ConfluenceModel.getContentById(req.params.id, (data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(500).json({ message: "An error occurred fetching the content" });
            }
        });
    }
);

module.exports = router;
