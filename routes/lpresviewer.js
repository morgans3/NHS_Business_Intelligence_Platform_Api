// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 *   name: LPRESViewer
 *   description: Methods for integration with LPRES Viewer
 */

/**
 * @swagger
 * /lpresviewer/generate-validation-key:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Get converted SSK
 *     tags:
 *      - LPRESViewer
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: nhsnumber
 *         description: Patient's NHS Number
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/generate-validation-key",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.nhsnumber) {
            res.status(400).send({ success: false, msg: "NHS Number not provided" });
            return;
        }
        const token = req.headers.authorization.replace("JWT ", "");
        const username = jwt.decode(token)["username"] || "test";
        const nhsnumber = req.body.nhsnumber;
        if (username === "test" || !nhsnumber) {
            res.status(400).json({
                success: false,
                msg: "Unable to parse request",
                token: null,
            });
        } else {
            const sha512 = require("js-sha512").sha512;
            const ssk = sha512(process.env.LPRES_SSK + "NEXUS" + username + nhsnumber);
            res.json({ success: true, token: ssk });
        }
    }
);

module.exports = router;
