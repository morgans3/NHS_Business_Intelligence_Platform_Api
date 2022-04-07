// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");
const credentials = require("../_credentials/credentials");
const pool = require("../config/database").pool;

const DIULibrary = require("diu-data-functions");
const CapabilitiesModel = new DIULibrary.Models.CapabilityModel(pool);
const CapabilityLinkModel = new DIULibrary.Models.CapabilityLinkModel(pool);
const RoleModel = new DIULibrary.Models.RoleModel(pool);

/**
 * @swagger
 * /{type}/{id}/capabilities:
 *   get:
 *     description: Get capabilities by a link type and link id combination
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: type
 *         description: The type name
 *         in: path
 *         required: false
 *         type: string
 *       - name: id
 *         description: The id of the type
 *         in: path
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: List of capabilities for that type
 */
router.get("/:type/:id/capabilities", (req, res, next) => {
    if(req.params.type) {
        CapabilitiesModel.getByLinkId(req.params.type.toLowerCase(), req.params.id, (err, capabilities) => {
            if (err) {
                res.json({ success: false, msg: "Error: " + err });
            } else {
                if (capabilities.length > 0) {
                    res.json(capabilities);
                } else {
                    res.json({ success: false, msg: "Error: Unable to find any capabilities assigned to this " + req.params.type.toLowerCase() });
                }
            }
        });
    } else {
        res.json({ success: false, msg: "Error: You must provide a type." });
    }
});

/**
 * @swagger
 * /{type}/{id}/roles:
 *   get:
 *     description: Get roles by a link type and link id combination
 *     security:
 *      - JWT: []
 *     tags:
 *      - Roles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: type
 *         description: The type name
 *         in: path
 *         required: false
 *         type: string
 *       - name: id
 *         description: The id of the type
 *         in: path
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: List of roles for that type
 */
router.get("/:type/:id/roles", (req, res, next) => {
    if (req.params.type) {
        RoleModel.getByLinkId(req.params.type.toLowerCase(), req.params.id, (err, roles) => {
            if (err) {
                res.json({ success: false, msg: "Error: " + err });
            } else {
                if (roles.length > 0) {
                    res.json(roles);
                } else {
                    res.json({ success: false, msg: "Error: Unable to find any roles assigned to this " + req.params.type.toLowerCase() });
                }
            }
        });
    } else {
        res.json({ success: false, msg: "Error: You must provide a type." });
    }
});

module.exports = router;