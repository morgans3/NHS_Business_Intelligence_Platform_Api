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
 * /lpresviewer/getValidationKey:
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
 *         description: Open Source Audit List
 */
router.post(
  "/getValidationKey",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
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
