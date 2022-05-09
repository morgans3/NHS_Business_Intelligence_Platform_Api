// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");

const DIULibrary = require("diu-data-functions");
const AtomicPayloadsModel = new DIULibrary.Models.AtomicPayloadsModel();

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

                // Found item?
                if (result.Items.length === 0) {
                    res.status(404).json({ success: false, msg: "Payload not found!" });
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
 *     description: Create a new payload
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
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        AtomicPayloadsModel.create(
            {
                id: req.body.id,
                type: req.body.type,
                config: req.body.config,
            },
            (err, result) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: false, msg: "New payload created!" });
            }
        );
    }
);

/**
 * @swagger
 * /atomic/payloads/update:
 *   post:
 *     description: Update a payload
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
 */
router.post(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        AtomicPayloadsModel.update(
            {
                id: req.body.id,
                type: req.body.type,
            },
            {
                config: req.body.config,
            },
            (err, result) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: false, msg: "Payload updated!" });
            }
        );
    }
);

/**
 * @swagger
 * /atomic/payloads/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a payload
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
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        // Delete cohort by id
        AtomicPayloadsModel.delete(
            {
                id: req.body.id,
                type: req.body.type,
            },
            (err, result) => {
                // Return data
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                    return;
                }
                res.json({ success: true, msg: "Payload deleted!" });
            }
        );
    }
);

module.exports = router;
