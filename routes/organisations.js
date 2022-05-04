// @ts-check

const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");
const DynamoDBData = require("diu-data-functions").Methods.DynamoDBData;
const tablename = "organisations";

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Methods for storing information on the Organisations associated with the BI Platform
 */

/**
 * @swagger
 * /organisations/:
 *   get:
 *     description: Get all Information
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: All data
 */
router.get("/", (req, res, next) => {
  DynamoDBData.getAll(AWS, tablename, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, msg: err });
    } else {
      res.json(result.Items);
    }
  });
});

/**
 * @swagger
 * /organisations/register:
 *   post:
 *     description: Registers a new Organisation
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Organisation Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authmethod
 *         description: Organisation Authentication Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: Organisation Contact
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Registration
 */
router.post(
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let newItem = {
      code: { S: req.body.code },
      name: { S: req.body.name },
      authmethod: { S: req.body.authmethod },
      contact: { S: req.body.contact },
    };

    DynamoDBData.addItem(AWS, tablename, newItem, (err, install) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to register: " + err,
        });
      } else {
        res.json({
          success: true,
          msg: "Registered",
          id: req.body.code,
        });
      }
    });
  }
);

/**
 * @swagger
 * /organisations/update:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates an Organisation
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Organisation Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authmethod
 *         description: Organisation Authentication Method
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: Organisation Contact
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of update
 */
router.post(
  "/update",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    DynamoDBData.updateItem(AWS, tablename, ["destination", "type"], req.body, (err, app) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to update: " + err,
        });
      }
      res.json({
        success: true,
        msg: "Updated",
      });
    });
  }
);

/**
 * @swagger
 * /organisations/remove:
 *   delete:
 *     description: Remove an organisation
 *     security:
 *      - JWT: []
 *     tags:
 *      - Organisations
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: code
 *         description: Organisation Code
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: Organisation Name
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of removal
 */
router.delete(
  "/remove",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    if (req.body.code && req.body.name) {
      const key = {
        code: { S: req.body.code },
        name: { S: req.body.name },
      };
      DynamoDBData.removeItem(AWS, tablename, key, (err, response) => {
        if (err) {
          res.status(400).json({
            success: false,
            msg: "Error: " + err,
          });
        } else {
          res.json({
            success: true,
            msg: "Removed",
          });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Error: No key provided",
      });
    }
  }
);

module.exports = router;
