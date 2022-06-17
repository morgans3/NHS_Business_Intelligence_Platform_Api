// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const RoleModel = new DIULibrary.Models.RoleModel();
const RoleLinkModel = new DIULibrary.Models.RoleLinkModel();
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: User/Role functionality
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     description: Get all roles
 *     tags:
 *      - Roles
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A list of available roles
 *       500:
 *         description: Database Error
 */
router.get("/", (req, res, next) => {
    RoleModel.get((err, result) => {
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
 * /roles/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create a new role. Requires Hall Montior
 *     tags:
 *      - Roles
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The role link data
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - description
 *            - authoriser
 *          properties:
 *            name:
 *              type: string
 *              description: Role name
 *            description:
 *              type: string
 *              description: Role description
 *            authoriser:
 *              type: string
 *              description: Role authoriser email
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The newly created role
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
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
    MiddlewareHelper.validate(
        "body",
        {
            name: { type: "string" },
            description: { type: "string" },
            authoriser: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const payload = req.body;
        RoleModel.create(
            {
                name: payload.name,
                description: payload.description,
                authoriser: payload.authoriser,
            },
            (err, result) => {
                // Error
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                } else {
                    res.json({
                        success: true,
                        msg: "Role created",
                        data: result[0],
                    });
                }
            }
        );
    }
);

/**
 * @swagger
 * /roles/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Update an existing role. Requires Hall Montior
 *     tags:
 *      - Roles
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The role link data
 *        schema:
 *          type: object
 *          required:
 *            - id
 *            - name
 *            - description
 *            - authoriser
 *          properties:
 *            id:
 *              type: integer
 *            name:
 *              type: string
 *              description: Role name
 *            description:
 *              type: string
 *              description: Role description
 *            authoriser:
 *              type: string
 *              description: Role authoriser email
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The newly created role
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
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
    MiddlewareHelper.validate(
        "body",
        {
            name: { type: "string" },
            description: { type: "string" },
            authoriser: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Get all capabilities
        const payload = req.body;
        RoleModel.updateByPrimaryKey(
            payload.id,
            {
                name: payload.name,
                description: payload.description,
                authoriser: payload.authoriser,
            },
            (err, result) => {
                // Error
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                } else {
                    res.json({
                        success: true,
                        msg: "Role updated",
                        data: result[0],
                    });
                }
            }
        );
    }
);

/**
 * @swagger
 * /roles/links/sync:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sync an array of role ids to a link id and type combination. Requires Hall Montior
 *     tags:
 *      - Roles
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The role link data
 *        schema:
 *          type: object
 *          required:
 *            - roles
 *            - link_id
 *            - link_type
 *          properties:
 *            roles:
 *              type: array
 *              items:
 *                type: string
 *            link_id:
 *              type: string
 *              description: Role link id
 *            link_type:
 *              type: string
 *              description: Role link type
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
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
    MiddlewareHelper.validate(
        "body",
        {
            roles: { type: "array" },
            link_id: { type: "string" },
            link_type: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Get params
        const payload = req.body;

        // Read jwt
        const user = JWT.decode(req.header("authorization").replace("JWT ", ""));

        // Create role links
        RoleLinkModel.link(
            payload.roles,
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
                res.json({ success: true, msg: "Role links synced" });
            }
        );
    }
);

/**
 * @swagger
 * /roles/links/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Create a new role link. Requires Hall Montior
 *     tags:
 *      - Roles
 *     parameters:
 *       - name: role_id
 *         description: Role id
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: link_id
 *         description: Role link id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link_type
 *         description: Role link type
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/links/create",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            role_id: { type: "string" },
            link_id: { type: "string" },
            link_type: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Get params
        const payload = req.body;

        // Read jwt
        const user = JWT.decode(req.header("authorization").replace("JWT ", ""));

        // Create role links
        RoleLinkModel.create(
            {
                role_id: payload.role_id,
                link_id: payload.link_id,
                link_type: payload.link_type,
                approved_by: user["email"],
            },
            (err, result) => {
                // Return data
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                    return;
                }
                res.json({ success: true, msg: "Role link created" });
            }
        );
    }
);

/**
 * @swagger
 * /roles/links/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a role link. Requires Hall Montior
 *     tags:
 *      - Roles
 *     parameters:
 *       - name: role_id
 *         description: Role id
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: link_id
 *         description: Role link id
 *         in: formData
 *         required: true
 *         type: string
 *       - name: link_type
 *         description: Role link type
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Success status
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/links/delete",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            role_id: { type: "string" },
            link_id: { type: "string" },
            link_type: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Get params
        const payload = req.body;

        // Create role links
        RoleLinkModel.deleteByLinkable(payload.role_id, payload.link_type, payload.link_id, (err, result) => {
            // Return data
            if (err) {
                res.status(500).json({ success: false, msg: err });
                return;
            }
            res.json({ success: true, msg: "Role link deleted" });
        });
    }
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get a single role by id
 *     tags:
 *      - Roles
 *     parameters:
 *       - name: id
 *         description: Role id to update
 *         in: path
 *         required: true
 *         type: integer
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The role
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        RoleModel.getByPrimaryKey(req.params.id, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: err });
            } else {
                if (result) {
                    res.json(result);
                } else {
                    res.status(404).json({ success: false, msg: "Role not found" });
                }
            }
        });
    }
);

/**
 * @swagger
 * /roles/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a role by it's id. Requires Hall Montior
 *     tags:
 *      - Roles
 *     parameters:
 *       - name: id
 *         description: Role id to update
 *         in: formData
 *         required: true
 *         type: integer
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The role
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       404:
 *         description: Not Found
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
    MiddlewareHelper.validate(
        "body",
        {
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        RoleModel.deleteByPrimaryKey(req.body.id, (err, deletedRole) => {
            // Handle error
            if (err) {
                res.status(500).json({ success: false, msg: err });
                return;
            }

            // Check if item existed
            if (deletedRole) {
                res.send({ success: true, msg: "Role deleted", data: deletedRole });
            } else {
                res.status(404).json({ success: false, msg: "Role not found" });
            }
        });
    }
);

module.exports = router;
