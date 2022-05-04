// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
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
 */
 router.get(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    SpiIncidentMethods.get((err, result) => {
      if(err) { res.status(500).send({ success: false, msg: err }); return; }
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
 */
 router.post("/create", passport.authenticate("jwt", {
  session: false,
}), (req, res, next) => {
  SpiIncidentMethods.create({
    method: req.body.method,
    dateCreated: req.body.dateCreated,
    list: req.body.list,
    priority: req.body.priority,
  }, (err, result) => {
    if(err) { res.status(500).send({ success: false, msg: err }); return; }
    res.send({ success: false, msg: "New incident created!" });
  });
});


/**
 * @swagger
 * /spi_incidentmethods/update:
 *   post:
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
 */
 router.post("/update", passport.authenticate("jwt", {
  session: false,
}), (req, res, next) => {
  SpiIncidentMethods.update({
    method: req.body.method,
    dateCreated: req.body.dateCreated,
  }, {
    list: req.body.list,
    priority: req.body.priority,
  }, (err, result) => {
    if(err) { res.status(500).send({ success: false, msg: err }); return; }
    res.send({ success: false, msg: "Incident updated!" });
  });
});

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
 *         description: Success status
 */
 router.delete("/delete", passport.authenticate("jwt", {
  session: false,
}), (req, res, next) => {
    //Delete cohort by id
    SpiIncidentMethods.delete({
      method: req.body.method,
      dateCreated: req.body.dateCreated,
    }, (err, result) => {
      //Return data
      if (err) {
        res.status(500).json({ success: false, msg: err });
        return;
      }
      res.json({ success: true, msg: "Incident deleted!" });
    });
  }
);

module.exports = router;
