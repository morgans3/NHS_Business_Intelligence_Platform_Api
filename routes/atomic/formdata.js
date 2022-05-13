// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");

const DIULibrary = require("diu-data-functions");
const AtomicFormDataModel = new DIULibrary.Models.AtomicFormDataModel();

/**
 * @swagger
 * tags:
 *   name: Atomic Formdata
 *   description: Formdata on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /atomic/formdata:
 *   get:
 *     description: Get all formdata
 *     security:
 *      - JWT: []
 *     tags:
 *      - Atomic Formdata
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of all formdata submitted
 *       401:
 *         description: Unauthorized
 *       500:
 *        description: Internal Server Error
 */
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        AtomicFormDataModel.get((err, result) => {
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
 * /atomic/formdata/{id}:
 *   get:
 *     description: Get all formdata
 *     security:
 *      - JWT: []
 *     tags:
 *      - Atomic Formdata
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: List of all formdata submitted
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
        AtomicFormDataModel.getByKeys(
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
                    res.status(404).json({ success: false, msg: "Formdata not found" });
                } else {
                    res.json(result.Items[0]);
                }
            }
        );
    }
);

/**
 * @swagger
 * /atomic/formdata/create:
 *   post:
 *     description: Create a new formdata
 *     security:
 *      - JWT: []
 *     tags:
 *      - Atomic Formdata
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Id for the new formdata
 *         in: formData
 *         required: true
 *         type: string
 *       - name: formid
 *         description: formid
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
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.id || !req.body.formid || !req.body.config) {
            res.status(400).json({ success: false, msg: "Not all parmaeters provided" });
            return;
        }
        AtomicFormDataModel.create(
            {
                id: req.body.id,
                formid: req.body.formid,
                config: req.body.config,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: true, msg: "New formdata created", data });
            }
        );
    }
);

/**
 * @swagger
 * /atomic/formdata/update:
 *   put:
 *     description: Update formdata
 *     security:
 *      - JWT: []
 *     tags:
 *      - Atomic Formdata
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Id of the formdata to update
 *         in: formData
 *         required: true
 *         type: string
 *       - name: formid
 *         description: formid
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
 *         description: Formdata item updated
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.id || !req.body.formid || !req.body.config) {
            res.status(400).json({ success: false, msg: "Not all parmaeters provided" });
            return;
        }
        AtomicFormDataModel.update(
            {
                id: req.body.id,
                formid: req.body.formid,
            },
            {
                config: req.body.config,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: true, msg: "Formdata updated", data });
            }
        );
    }
);

/**
 * @swagger
 * /atomic/formdata/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete formdata
 *     tags:
 *      - Atomic Formdata
 *     parameters:
 *       - name: id
 *         description: Id of the formdata to delete
 *         in: formData
 *         required: true
 *         type: string
 *       - name: formid
 *         description: formid
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
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        if (!req.body.id || !req.body.formid) {
            res.status(400).json({ success: false, msg: "Not all parmaeters provided" });
            return;
        }
        AtomicFormDataModel.delete(
            {
                id: req.body.id,
                formid: req.body.formid,
            },
            (err, result) => {
                // Return data
                if (err) {
                    res.status(500).json({ success: false, msg: err });
                    return;
                }
                res.json({ success: true, msg: "Formdata deleted" });
            }
        );
    }
);

module.exports = router;
