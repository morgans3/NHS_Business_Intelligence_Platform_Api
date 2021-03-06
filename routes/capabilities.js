// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const CapabilitiesModel = new DIULibrary.Models.CapabilityModel();
const CapabilityLinkModel = new DIULibrary.Models.CapabilityLinkModel();
const RoleModel = new DIULibrary.Models.RoleModel();
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: Capabilities
 *   description: User/Role capability functionality
 */

/**
 * @swagger
 * /capabilities:
 *   get:
 *     description: Get all capabilties
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A list of available capabilties
 *       500:
 *         description: Internal Server Error
 */
router.get("/", (req, res, next) => {
    // Get all capabilities
    CapabilitiesModel.get((err, result) => {
        // Return data
        if (err) {
            res.status(500).json({ success: false, msg: err });
        } else {
            res.json(result);
        }
    });
});

/**
 * @swagger
 * /capabilities/create:
 *   post:
 *     description: Create a capability. Requires Hall Montior
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the capability name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: A description of what the capability allows the user to do.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: value
 *         description: JSON data containing the config for the capability.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authoriser
 *         description: The member of staff responsible for creating this capability.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: tags[]
 *         description: An array of tags assigned to this capability.
 *         in: formData
 *         required: false
 *         type: array
 *         items:
 *          type: string
 *         example: ["str1", "str2", "str3"]
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       401:
 *        description: Unauthorised
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/create",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        const newCapability = {
            name: req.body.name,
            description: req.body.description,
            value: req.body.value,
            authoriser: req.body.authoriser,
            tags: req.body.tags,
        };
        CapabilitiesModel.create(newCapability, (err) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Capability registered",
                    data: newCapability,
                });
            }
        });
    }
);

/**
 * @swagger
 * /capabilities/update:
 *   put:
 *     description: Updates a capability. Requires Hall Montior
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: The ID of the capability being updated.
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: name
 *         description: The name of the capability name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: A description of what the capability allows the user to do.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: value
 *         description: JSON data containing the config for the capability.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authoriser
 *         description: The member of staff responsible for creating this capability.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: tags[]
 *         description: An array of tags assigned to this capability.
 *         in: formData
 *         required: false
 *         type: array
 *         items:
 *          type: string
 *         example: ["str1", "str2", "str3"]
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       401:
 *         description: Unauthorised
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: Capability not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
    "/update",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        const newCapability = {
            name: req.body.name,
            description: req.body.description,
            value: req.body.value,
            authoriser: req.body.authoriser,
            tags: req.body.tags,
        };
        CapabilitiesModel.getByPrimaryKey(req.body.id, function (err, data) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + err,
                });
            } else {
                if (data) {
                    CapabilitiesModel.updateByPrimaryKey(req.body.id, newCapability, (errUpdate, user) => {
                        if (errUpdate) {
                            res.status(500).json({
                                success: false,
                                msg: "Error: " + errUpdate,
                            });
                        } else {
                            res.json({
                                success: true,
                                msg: "Capability updated",
                                data: newCapability,
                            });
                        }
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        msg: "Error: Unable to find item with the primary key entered.",
                    });
                }
            }
        });
    }
);

/**
 * @swagger
 * /capabilities/delete:
 *   delete:
 *     description: Delete a capability. Requires Hall Montior
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: The ID of the capability being updated.
 *         in: formData
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       401:
 *         description: Unauthorised
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: Capability not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/delete",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        CapabilitiesModel.deleteByPrimaryKey(req.body.id, (errDelete, deletedCapability) => {
            // Handle error
            if (errDelete) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + errDelete,
                });
                return;
            }

            // Check if item existed
            if (deletedCapability) {
                res.send({ success: true, msg: "Capability deleted", data: deletedCapability });
            } else {
                res.status(404).json({ success: false, msg: "Capability not found" });
            }
        });
    }
);

/**
 * @swagger
 * /capabilities/{id}:
 *   get:
 *     description: Get a capability by passing the ID
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: The ID of the capability being updated.
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       404:
 *         description: Capability not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", (req, res, next) => {
    CapabilitiesModel.getByPrimaryKey(req.params.id, function (err, data) {
        if (err) {
            res.status(500).json({ success: false, msg: "Error: " + err });
        } else {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({
                    success: false,
                    msg: "Error: Unable to find item with the primary key entered.",
                });
            }
        }
    });
});

/**
 * @swagger
 * /capabilities/tags/getByTag:
 *   get:
 *     description: Get a capability by passing the name of a tag
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: tags
 *         description: An array of tags assigned to this capability.
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/tags/getByTag",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        CapabilitiesModel.getByTag(req.query.tags, function (err, data) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + err,
                });
            } else {
                if (data.length > 0) {
                    res.json(data);
                } else {
                    res.status(204).json({
                        success: false,
                        msg: "Error: Unable to find items with the tag assigned.",
                    });
                }
            }
        });
    }
);

/**
 * @swagger
 * /capabilities/tags/getByTagsAnd:
 *   get:
 *     description: Get a capability by passing the name of a tag
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: tags[]
 *         description: An array of tags assigned to this capability.
 *         in: query
 *         required: false
 *         type: array
 *         items:
 *          type: string
 *         example: ["str1", "str2", "str3"]
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/tags/getByTagsAnd",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (req.query.tags) {
            CapabilitiesModel.getByTagsAnd(req.query.tags, function (err, data) {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Error: " + err,
                    });
                } else {
                    if (data.length > 0) {
                        res.json(data);
                    } else {
                        res.status(204).json({
                            success: false,
                            msg: "Error: Unable to find items with all of the tags assigned.",
                        });
                    }
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Error: You must provide at least 1 tag.",
            });
        }
    }
);

/**
 * @swagger
 * /capabilities/tags/getByTagsOr:
 *   get:
 *     description: Get a capability by passing the name of a tag
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: tags[]
 *         description: An array of tags assigned to this capability.
 *         in: query
 *         required: false
 *         type: array
 *         items:
 *          type: string
 *         example: ["str1", "str2", "str3"]
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/tags/getByTagsOr",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (req.query.tags) {
            CapabilitiesModel.getByTagsOr(req.query.tags, function (err, data) {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Error: " + err,
                    });
                } else {
                    if (data.length > 0) {
                        res.json(data);
                    } else {
                        res.status(204).json({
                            success: false,
                            msg: "Error: Unable to find any items with at least one of the tags assigned.",
                        });
                    }
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Error: You must provide at least 1 tag.",
            });
        }
    }
);

/**
 * @swagger
 * /capabilities/links/sync:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sync an array of capability ids to a link id and type combination. Requires Hall Montior
 *     tags:
 *      - Capabilities
 *     parameters:
 *       - name: capabilities[]
 *         description: Array of capability ids with their value
 *         in: formData
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             valuejson:
 *               type: string
 *       - name: link_id
 *         description: Capability link id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link_type
 *         description: Capability link type
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       403:
 *         description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/links/sync",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        // Get params
        const payload = req.body;

        // Read jwt
        const user = JWT.decode(req.header("authorization").replace("JWT ", ""));

        // Create role links
        CapabilityLinkModel.link(
            payload.capabilities,
            {
                id: payload.link_id,
                type: payload.link_type,
                approved_by: user["email"],
            },
            (err, result) => {
                // Return data
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                    return;
                }
                res.json({ success: true, msg: "Capability links synced" });
            }
        );
    }
);

/**
 * @swagger
 * /capabilities/links/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create or update a capability link. Requires Hall Montior
 *     tags:
 *      - Capabilities
 *     parameters:
 *       - name: capability_id
 *         description: Capability id
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: link_id
 *         description: Capability link id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link_type
 *         description: Capability link type
 *         in: formData
 *         required: true
 *         type: string
 *       - name: valuejson
 *         description: Capability value
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/links/create",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
    ],
    (req, res, next) => {
        // Check that user has permission
        const user = JWT.decode(req.header("authorization").replace("JWT ", ""));
        CapabilitiesModel.getByPrimaryKey(req.body.capability_id, (error, capability) => {
            if (!capability || error) {
                res.status(400).json({ success: false, msg: error || "Capability not found" });
            } else if (capability.authoriser === null && req.body.link_id === `${user.username}#${user.organisation}`) {
                next();
            } else {
                MiddlewareHelper.userHasCapability("Hall Monitor")(req, res, next);
            }
        });
    },
    (req, res, next) => {
        // Get params
        const payload = req.body;

        // Read jwt
        const user = JWT.decode(req.header("authorization").replace("JWT ", ""));

        CapabilityLinkModel.create(
            {
                capability_id: payload.capability_id,
                link_id: payload.link_id,
                link_type: payload.link_type,
                valuejson: payload.valuejson,
                approved_by: user["email"],
            },
            (err, result) => {
                // Return data
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                    return;
                }
                res.json({ success: true, msg: "Capability link created" });
            }
        );
    }
);

/**
 * @swagger
 * /capabilities/links/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a capability link. Requires Hall Montior
 *     tags:
 *      - Capabilities
 *     parameters:
 *       - name: capability_id
 *         description: Capability id
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: link_id
 *         description: Capability link id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link_type
 *         description: Capability link type
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       400:
 *        description: Bad Request
 *       401:
 *        description: Unauthorised
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *        description: Internal Server Error
 */
router.delete(
    "/links/delete",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        (req, res, next) => {
            // Check that user has permission
            const user = JWT.decode(req.header("authorization").replace("JWT ", ""));
            if (req.body.link_id === `${user.username}#${user.organisation}`) {
                next();
            } else {
                MiddlewareHelper.userHasCapability("Hall Monitor")(req, res, next);
            }
        },
    ],
    (req, res, next) => {
        // Get params
        const payload = req.body;

        // Create role links
        CapabilityLinkModel.deleteByLinkable(payload.capability_id, payload.link_type, payload.link_id, (err, links) => {
            // Return data
            if (err) {
                res.status(500).json({ success: false, msg: err });
                return;
            }

            res.json({ success: true, msg: "Capability link deleted" });
        });
    }
);

/**
 * @swagger
 * /capabilities/roles/getByRoleName:
 *   get:
 *     description: Get a capability by passing the name of a role
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: roleName
 *         description: The name of the role the capabilities are assigned to.
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/roles/getByRoleName",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const roleName = req.query.roleName;
        if (roleName) {
            RoleModel.getByName(roleName, function (err, data) {
                if (err) {
                    res.status(500).json({ success: false, msg: "Error: " + err });
                } else {
                    if (data.length > 0) {
                        const arrRoleID = data.map((a) => {
                            return a.id;
                        });
                        CapabilitiesModel.getByLinkIds("role", arrRoleID, function (errLinks, capabilitiesData) {
                            if (errLinks) {
                                res.status(500).json({
                                    success: false,
                                    msg: "Error: " + errLinks,
                                });
                            } else {
                                if (capabilitiesData.length > 0) {
                                    res.json(capabilitiesData);
                                } else {
                                    res.status(204).json({
                                        success: false,
                                        msg: "Error: Unable to find any capabilities assigned to this role.",
                                    });
                                }
                            }
                        });
                    } else {
                        res.status(204).json({
                            success: false,
                            msg: "Error: Unable to find any roles with this name.",
                        });
                    }
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Error: You must provide a role name.",
            });
        }
    }
);

/**
 * @swagger
 * /capabilities/teamids/getByTeamIDs:
 *   get:
 *     description: Get a capability by passing the combined string of username and organisation
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: teamname
 *         description: The combined string of the username and organisation
 *         in: query
 *         required: true
 *         type: array
 *         items:
 *          type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/teamids/getByTeamIDs",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const teamname = req.query.teamname;
        if (!teamname) {
            res.status(400).json({ success: false, msg: "Error: You must provide a teamname." });
            return;
        }
        const teamIDs = teamname.toString().split(",");
        if (teamIDs) {
            CapabilitiesModel.getByLinkIds("team", teamIDs, function (err, capabilitiesData) {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Error: " + err,
                    });
                } else {
                    if (capabilitiesData.length > 0) {
                        res.json(capabilitiesData);
                    } else {
                        res.status(204).json({
                            success: false,
                            msg: "Error: Unable to find any capabilities assigned to the teams provided.",
                        });
                    }
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Error: You must provide a teamname.",
            });
        }
    }
);

/**
 * @swagger
 * /capabilities/getAllCapabilitesWithTeamAndUsername:
 *   post:
 *     description: Get a capability by passing the combined string of username and organisation
 *     security:
 *      - JWT: []
 *     tags:
 *      - Capabilities
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: The combined string of the username and organisation
 *         in: formData
 *         required: true
 *         type: string
 *       - name: teamcodes
 *         description: A comma separated list of team codes
 *         in: formData
 *         required: true
 *         type: array
 *         items:
 *          type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/getAllCapabilitesWithTeamAndUsername",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const username = req.body.username;
        const teamcodes = req.body.teamcodes.split(",");
        if (username && teamcodes) {
            // Get all team roles
            CapabilitiesModel.getAllCapabilitiesFromTeamArrayAndUserID(teamcodes, username, function (err, capabilitiesData) {
                if (err) {
                    res.status(500).json({
                        success: false,
                        msg: "Error: " + err,
                    });
                } else {
                    res.json(capabilitiesData);
                }
            });
        } else {
            res.status(400).json({
                success: false,
                msg: "Error: You must provide a username.",
            });
        }
    }
);

module.exports = router;
