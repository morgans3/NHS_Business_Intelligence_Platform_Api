// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const RoleModel = new DIULibrary.Models.RoleModel();
const RoleLinkModel = new DIULibrary.Models.RoleLinkModel();
const CapabilityLinkModel = new DIULibrary.Models.CapabilityLinkModel();

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
 *     security:
 *      - JWT: []
 *     description: Get all roles
 *     tags:
 *      - Roles
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: A list of available roles
 */
router.get("/", passport.authenticate("jwt", { session: false }), (req, res, next) => {
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
 *     description: Create a new role
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
 *            - capabilities
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
 *            capabilities:
 *              type: array
 *              items:
 *                type: string
 *                description: List of capability ids for the role
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The newly created role
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                    return;
                }

                // Read jwt
                const user = req.header("authorization");
                const decodedToken = JWT.decode(user.replace("JWT ", ""));

                // Create capability links
                const role = result[0];
                payload.capabilities = payload.capabilities.map((c) => parseInt(c));
                CapabilityLinkModel.link(
                    payload.capabilities,
                    {
                        id: role.id,
                        type: "role",
                        approved_by: decodedToken["email"],
                    },
                    (errMethod) => {
                        if (errMethod) {
                            res.status(500).json({ success: false, msg: errMethod });
                            return;
                        }
                        res.json({
                            success: true,
                            msg: "Role created",
                            data: Object.assign(role, { capabilities: payload.capabilities }),
                        });
                    }
                );
            }
        );
    }
);

/**
 * @swagger
 * /roles/update:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Update an existing role
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
 *            - capabilities
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
 *            capabilities:
 *              type: array
 *              items:
 *                type: string
 *                description: List of capability ids for the role
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: The updated role
 */
router.post(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                    return;
                }

                // Read jwt
                const user = req.header("authorization");
                const decodedToken = JWT.decode(user.replace("JWT ", ""));

                // Create role link
                const role = result[0];
                payload.capabilities = payload.capabilities.map((c) => parseInt(c));
                CapabilityLinkModel.link(
                    payload.capabilities,
                    {
                        id: role.id,
                        type: "role",
                        approved_by: decodedToken["email"],
                    },
                    (linkError) => {
                        if (linkError) {
                            res.status(500).json({ success: false, msg: linkError });
                            return;
                        }
                        res.json({
                            success: true,
                            msg: "Role updated",
                            data: Object.assign(role, { capabilities: payload.capabilities }),
                        });
                    }
                );
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
 *     description: Sync an array of role ids to a link id and type combination
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
 */
router.post(
    "/links/sync",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                res.json({ success: true, msg: "Role links synced!" });
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
 *     description: Create a new role link
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
 */
router.post(
    "/links/create",
    passport.authenticate("jwt", {
        session: false,
    }),
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
                res.json({ success: true, msg: "Role link created!" });
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
 *     description: Delete a role link
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
 */
router.delete(
    "/links/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
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
            res.json({ success: true, msg: "Role link deleted!" });
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
                res.json(result);
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
 *     description: Delete a role by it's id
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
 *         description: Role deletion status
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // Get all capabilities
        RoleModel.deleteByPrimaryKey(req.body.id, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: err });
            } else {
                res.json({ success: true, msg: "Role deleted successfully!" });
            }
        });
    }
);

module.exports = router;
