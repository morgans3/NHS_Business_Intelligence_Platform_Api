// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const App = require("../models/apps");

/**
 * @swagger
 * tags:
 *   name: Application
 *   description: Applications on the Nexus Intelligence Platform
 */

/**
 * @swagger
 * /apps/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers an App
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: App's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: App's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: App's icon
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerName
 *         description: Owner's Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerEmail
 *         description: Owner's Email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: environment
 *         description: App's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: App's url
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: images
 *         description: List of Images
 *         in: formData
 *         type: array
 *         items:
 *           type: string
 *     responses:
 *       200:
 *         description: Confirmation of App Registration
 */
router.post(
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let newApp = {
      name: { S: req.body.name },
      status: { S: req.body.status },
      icon: { S: req.body.icon },
      url: { S: req.body.url },
      ownerName: { S: req.body.ownerName },
      ownerEmail: { S: req.body.ownerEmail },
      environment: { S: req.body.environment },
      description: { S: req.body.description },
    };
    if (req.body.images) {
      try {
        newApp["images"] = { SS: req.body.images.split(",") };
      } catch (ex) {
        newApp["images"] = { SS: req.body.images };
      }
    }

    App.addApp(newApp, (err, user) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to register: " + err,
        });
      } else {
        res.json({
          success: true,
          msg: "Registered",
        });
      }
    });
  }
);

/**
 * @swagger
 * /apps/update?app_name={app_name}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an App
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: app_name
 *         description: App's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: name
 *         description: App's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: App's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: App's icon
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerName
 *         description: Owner's Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ownerEmail
 *         description: Owner's Email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: environment
 *         description: App's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: App's url
 *         in: formData
 *         required: true
 *         type: string
 *       - name: description
 *         description: Description
 *         in: formData
 *         required: true
 *         type: string
 *       - name: images
 *         description: List of Images
 *         in: formData
 *         type: array
 *         items:
 *           type: string
 *     responses:
 *       200:
 *         description: Confirmation of App Registration
 */
router.put(
  "/update",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.app_name;
    App.getAppByName(id, function (err, app) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to update: " + err,
        });
      }
      var scannedItem = app.Items[0];
      var archive = false;
      scannedItem.name = req.body.name;
      scannedItem.status = req.body.status;
      scannedItem.ownerName = req.body.ownerName;
      scannedItem.ownerEmail = req.body.ownerEmail;
      scannedItem.environment = req.body.environment;
      scannedItem.icon = req.body.icon;
      scannedItem.url = req.body.url;
      scannedItem.description = req.body.description;
      if (req.body.images) scannedItem.images = req.body.images;

      App.updateApp(scannedItem, function (err, data) {
        if (err) {
          res.json({
            success: false,
            msg: "Failed to update: " + err,
          });
        }
        res.json({
          success: true,
          msg: "App updated",
        });
      });
    });
  }
);

/**
 * @swagger
 * /apps/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get("/getAll", (req, res, next) => {
  App.getAll(function (err, result) {
    if (err) {
      res.send(err);
    } else {
      if (result.Items) {
        res.send(JSON.stringify(result.Items));
      } else {
        res.send("[]");
      }
    }
  });
});

/**
 * @swagger
 * /apps/getByName?app_Name={app_Name}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: app_Name
 *         description: App's Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
  "/getByName",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    const id = req.query.app_name;
    App.getAppByName(id, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.Items) {
          res.send(JSON.stringify(result.Items));
        } else {
          res.send("[]");
        }
      }
    });
  }
);

/**
 * @swagger
 * /apps/archive?app_name={app_name}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Archives an App
 *     tags:
 *      - Application
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: app_name
 *         description: App's ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of App being Archived
 */
router.put(
  "/archive",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.app_name;
    App.getAppByName(id, function (err, app) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      var scannedItem = app.Items[0];
      App.removeApp(scannedItem.name, scannedItem.environment, function (err, data) {
        if (err) {
          res.json({
            success: false,
            msg: "Failed to update: " + err,
          });
        }
        res.json({
          success: true,
          msg: "App removed",
        });
      });
    });
  }
);

module.exports = router;
