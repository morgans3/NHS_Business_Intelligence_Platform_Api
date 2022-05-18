// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const SpiIncidentMethods = new DIULibrary.Models.SpiIncidentMethods();

/**
 * @swagger
 * tags:
 *   name: SPI Incident Methods
 *   description: SPI Incident endpoints
 */

/**
 * @swagger
 * /spi_incidentmethods/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - SPI Incident Methods
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
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
        SpiIncidentMethods.get((err, result) => {
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
 * /spi_incidentmethods/create:
 *   post:
 *     description: Create a new incident
 *     security:
 *      - JWT: []
 *     tags:
 *      - SPI Incident Methods
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: method
 *         description: Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: dateCreated
 *         description: Date created
 *         in: formData
 *         required: true
 *         type: string
 *       - name: list
 *         description: List
 *         in: formData
 *         required: true
 *         type: string
 *       - name: priority
 *         description: Priority
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Create an incident
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
    MiddlewareHelper.validate(
        "body",
        {
            method: { type: "string" },
            dateCreated: { type: "string" },
            list: { type: "string" },
            priority: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        SpiIncidentMethods.create(
            {
                method: req.body.method,
                dateCreated: req.body.dateCreated,
                list: req.body.list,
                priority: req.body.priority,
            },
            (err, data) => {
                if (err) {
                    res.status(500).send({ success: false, msg: err });
                    return;
                }
                res.send({ success: true, msg: "New incident created", data });
            }
        );
    }
);

/**
 * @swagger
 * /spi_incidentmethods/update:
 *   put:
 *     description: Update an incident
 *     security:
 *      - JWT: []
 *     tags:
 *      - SPI Incident Methods
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: method
 *         description: Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: dateCreated
 *         description: Date created
 *         in: formData
 *         required: true
 *         type: string
 *       - name: list
 *         description: List
 *         in: formData
 *         required: true
 *         type: string
 *       - name: priority
 *         description: Priority
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Incident updated
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            method: { type: "string" },
            dateCreated: { type: "string" },
            list: { type: "string" },
            priority: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const key = {
            method: req.body.method,
            dateCreated: req.body.dateCreated,
        };
        SpiIncidentMethods.getByKeys(key, (errGet, resultGet) => {
            if (errGet) {
                res.status(500).send({ success: false, msg: errGet });
                return;
            }
            if (resultGet.Items.length === 0) {
                res.status(404).send({ success: false, msg: "Not Found" });
                return;
            }
            SpiIncidentMethods.update(
                key,
                {
                    list: req.body.list,
                    priority: req.body.priority,
                },
                (err, result) => {
                    if (err) {
                        res.status(500).send({ success: false, msg: err });
                        return;
                    }
                    res.send({ success: true, msg: "Incident updated" });
                }
            );
        });
    }
);

/**
 * @swagger
 * /spi_incidentmethods/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete formdata
 *     tags:
 *      - SPI Incident Methods
 *     parameters:
 *       - name: method
 *         description: Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: dateCreated
 *         description: Date created
 *         in: formData
 *         required: true
 *         type: string
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Incident updated
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
    "/delete",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            method: { type: "string" },
            dateCreated: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const key = {
            method: req.body.method,
            dateCreated: req.body.dateCreated,
        };

        SpiIncidentMethods.delete(key, (err, result) => {
            if (err) {
                res.status(500).json({ success: false, msg: err });
                return;
            }
            if (result.Attributes) {
                res.send({ success: true, msg: "Payload deleted", data: result.Attributes });
            } else {
                res.status(404).json({ success: false, msg: "Payload not found" });
            }
        });
    }
);

module.exports = router;
