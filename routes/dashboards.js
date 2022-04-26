// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Dashboards = require("../models/dashboards");

/**
 * @swagger
 * tags:
 *   name: Dashboards
 *   description: Dashboards on the NHS BI Platform
 */

/**
 * @swagger
 * /dashboards/register:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a Dashboard
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: Dashboard's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: Dashboard's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: Dashboard's icon
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
 *         description: Dashboard's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: Dashboard's url
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
 *         description: Confirmation of Dashboard Registration
 */
router.post(
  "/register",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    let newDashboard = {
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
        newDashboard["images"] = { SS: req.body.images.split(",") };
      } catch (ex) {
        newDashboard["images"] = { SS: req.body.images };
      }
    }

    Dashboards.addDashboard(newDashboard, (err, user) => {
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
 * /dashboards/update?dashboard_name={dashboard_name}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates an Dashboard
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: dashboard_name
 *         description: Dashboard's ID
 *         in: query
 *         required: true
 *         type: string
 *       - name: name
 *         description: Dashboard's name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: status
 *         description: Dashboard's Status
 *         in: formData
 *         required: true
 *         type: string
 *       - name: icon
 *         description: Dashboard's icon
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
 *         description: Dashboard's Environment
 *         in: formData
 *         required: true
 *         type: string
 *       - name: url
 *         description: Dashboard's url
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
 *         description: Confirmation of Dashboard Registration
 */
router.put(
  "/update",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.dashboard_name;
    Dashboards.getDashboardByName(id, function (err, app) {
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

      Dashboards.updateDashboard(scannedItem, function (err, data) {
        if (err) {
          res.json({
            success: false,
            msg: "Failed to update: " + err,
          });
        }
        res.json({
          success: true,
          msg: "Dashboard updated",
        });
      });
    });
  }
);

/**
 * @swagger
 * /dashboards/getAll:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get("/getAll", (req, res, next) => {
  Dashboards.getAll(function (err, result) {
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
 * /dashboards/getByName?dashboard_Name={dashboard_Name}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: dashboard_Name
 *         description: Dashboard's Name
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
    const id = req.query.dashboard_name;
    Dashboards.getDashboardByName(id, function (err, result) {
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
 * /dashboards/archive?dashboard_name={dashboard_name}:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Archives an Dashboard
 *     tags:
 *      - Dashboards
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: dashboard_name
 *         description: Dashboard's ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Dashboard being Archived
 */
router.put(
  "/archive",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const id = req.query.dashboard_name;
    Dashboards.getDashboardByName(id, function (err, app) {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to archive: " + err,
        });
      }
      var scannedItem = app.Items[0];
      Dashboards.removeDashboard(scannedItem.name, scannedItem.environment, function (err, data) {
        if (err) {
          res.json({
            success: false,
            msg: "Failed to update: " + err,
          });
        }
        res.json({
          success: true,
          msg: "Dashboard removed",
        });
      });
    });
  }
);

module.exports = router;
