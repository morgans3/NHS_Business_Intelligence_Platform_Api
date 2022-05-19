// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");

const DIULibrary = require("diu-data-functions");
const AtomicPayloadsModel = new DIULibrary.Models.AtomicPayloadsModel();
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: AtomicPayloads
 *   description: Payloads on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /atomic/payloads:
 *   get:
 *     description: Get all payloads
 *     security:
 *      - JWT: []
 *     tags:
 *      - AtomicPayloads
 *     parameters:
 *       - name: type
 *         description: Filter by type
 *         in: query
 *         required: false
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of all atomic payloads
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        AtomicPayloadsModel.get(req.query, (err, result) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send(result.Items);
        });
    }
);

/**
 * @swagger
 * /atomic/payloads/{id}:
 *   get:
 *     description: Get all payloads
 *     security:
 *      - JWT: []
 *     tags:
 *      - AtomicPayloads
 *     parameters:
 *      - name: id
 *        description: Payload id
 *        type: string
 *        in: path
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of all atomic payloads
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        AtomicPayloadsModel.getByKeys(
            {
                id: req.params.id,
            },
            (err, result) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }

                if (result.Items.length === 0) {
                    res.status(404).json({ success: false, msg: "Payload not found" });
                } else {
                    res.json(result.Items[0]);
                }
            }
        );
    }
);

/**
 * @swagger
 * /atomic/payloads/create:
 *   post:
 *     description: Create a new payload. Requires Hall Monitor or Creator capability
 *     security:
 *      - JWT: []
 *     tags:
 *      - AtomicPayloads
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Id for the new payload
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: type
 *         in: formData
 *         required: true
 *         type: string
 *       - name: config
 *         description: config
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Create a formdata item
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
    "/create",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability(["Hall Monitor", "Creator"]),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            id: { type: "string" },
            type: { type: "string" },
            config: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        AtomicPayloadsModel.create(
            {
                id: req.body.id,
                type: req.body.type,
                config: req.body.config,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: true, msg: "New payload created", data });
            }
        );
    }
);

/**
 * @swagger
 * /atomic/payloads/update:
 *   put:
 *     description: Update a payload. Requires Hall Monitor or Creator capability
 *     security:
 *      - JWT: []
 *     tags:
 *      - AtomicPayloads
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Id of the formdata to update
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: type
 *         in: formData
 *         required: true
 *         type: string
 *       - name: config
 *         description: config
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden due to capability requirements
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
    "/update",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability(["Hall Monitor", "Creator"]),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            id: { type: "string" },
            type: { type: "string" },
            config: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const keys = {
            id: req.body.id,
            type: req.body.type,
        };
        AtomicPayloadsModel.getByKeys(keys, (errGet, resultGet) => {
            // Check for error
            if (errGet) {
                res.status(500).send({ success: false, msg: errGet });
                return;
            }

            // Check item exists
            if (resultGet.Items.length === 0) {
                res.status(404).json({ success: false, msg: "Payload not found" });
                return;
            }

            // Udpate item
            AtomicPayloadsModel.update(keys, { config: req.body.config }, (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: true, msg: "Payload updated", data: req.body });
            });
        });
    }
);

/**
 * @swagger
 * /atomic/payloads/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a payload. Requires Hall Monitor or Creator capability
 *     tags:
 *      - AtomicPayloads
 *     parameters:
 *       - name: id
 *         description: Id of the payload to delete
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: type
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
 *        description: Forbidden due to capability requirements
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/delete",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability(["Hall Monitor", "Creator"]),
    ],
    MiddlewareHelper.validate(
        "body",
        {
            id: { type: "string" },
            type: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const keys = {
            id: req.body.id,
            type: req.body.type,
        };
        AtomicPayloadsModel.delete(keys, (errDelete, errResult) => {
            if (errDelete) {
                res.status(500).send({ success: false, msg: errDelete });
                return;
            }
            if (errResult.Attributes) {
                res.send({ success: true, msg: "Payload deleted", data: errResult.Attributes });
            } else {
                res.status(404).json({ success: false, msg: "Payload not found" });
            }
        });
    }
);

module.exports = router;
