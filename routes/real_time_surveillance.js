// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const RealTimeSurveillance = new DIULibrary.Models.RealTimeSurveillance();

/**
 * @swagger
 * tags:
 *   name: Real Time Surveillance
 *   description: SPI Incidents
 */

/**
 * @swagger
 * /real_time_surveillance:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Real Time Surveillance
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
        RealTimeSurveillance.get((err, result) => {
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
 * /real_time_surveillance/create:
 *   post:
 *     description: Create a new incident
 *     security:
 *      - JWT: []
 *     tags:
 *      - Real Time Surveillance
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: index
 *         description: Index
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ics
 *         description: ICS
 *         in: formData
 *         required: false
 *         type: string
 *       - name: type
 *         description: Type
 *         in: formData
 *         required: false
 *         type: string
 *       - name: method
 *         description: Method
 *         in: formData
 *         required: false
 *         type: string
 *       - name: bcu
 *         description: BCU
 *         in: formData
 *         required: false
 *         type: string
 *       - name: coroner_area
 *         description: Coroner Area
 *         in: formData
 *         required: false
 *         type: string
 *       - name: csp_district
 *         description: CSP District
 *         in: formData
 *         required: false
 *         type: string
 *       - name: ccg
 *         description: CCG
 *         in: formData
 *         required: false
 *         type: string
 *       - name: lancs12
 *         description: Lancs 12
 *         in: formData
 *         required: false
 *         type: string
 *       - name: asc_lcc_update
 *         description: ACS LCC Update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: delphi_update
 *         description: Delphi Update (addition services)
 *         in: formData
 *         required: false
 *         type: string
 *       - name: details
 *         description: Details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: ethnicity
 *         description: Ethnicity
 *         in: formData
 *         required: false
 *         type: string
 *       - name: cgl_update
 *         description: CGL Update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: da
 *         description: Domestic Abuse
 *         in: formData
 *         required: false
 *         type: string
 *       - name: forename
 *         description: Forename
 *         in: formData
 *         required: false
 *         type: string
 *       - name: surname
 *         description: Surname
 *         in: formData
 *         required: false
 *         type: string
 *       - name: csp_resident
 *         description: CSP Resident
 *         in: formData
 *         required: false
 *         type: string
 *       - name: reported_by
 *         description: Reported By
 *         in: formData
 *         required: false
 *         type: string
 *       - name: incident_ref
 *         description: Incident Ref
 *         in: formData
 *         required: false
 *         type: string
 *       - name: date
 *         description: Date
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type_of_location
 *         description: Type of Location
 *         in: formData
 *         required: false
 *         type: string
 *       - name: local_authority
 *         description: Local Authority
 *         in: formData
 *         required: false
 *         type: string
 *       - name: gender
 *         description: Gender
 *         in: formData
 *         required: false
 *         type: string
 *       - name: date_of_birth
 *         description: Date of birth
 *         in: formData
 *         required: true
 *         type: string
 *       - name: occupation
 *         description: Occupation
 *         in: formData
 *         required: false
 *         type: string
 *       - name: type_of_job
 *         description: Type of Job
 *         in: formData
 *         required: false
 *         type: string
 *       - name: employment
 *         description: Employment
 *         in: formData
 *         required: false
 *         type: string
 *       - name: imd_decile
 *         description: IMD Decile
 *         in: formData
 *         required: false
 *         type: string
 *       - name: local
 *         description: Local
 *         in: formData
 *         required: false
 *         type: string
 *       - name: registered_gp_practice
 *         description: Registered GP Practice
 *         in: formData
 *         required: false
 *         type: string
 *       - name: gp_name
 *         description: GP Name
 *         in: formData
 *         required: false
 *         type: string
 *       - name: medication
 *         description: Medication
 *         in: formData
 *         required: false
 *         type: string
 *       - name: bereavement_offered
 *         description: Bereavement Offered
 *         in: formData
 *         required: false
 *         type: string
 *       - name: inquest_conclusion
 *         description: Inquest Conclusion
 *         in: formData
 *         required: false
 *         type: string
 *       - name: inquest_date
 *         description: Inquest Date
 *         in: formData
 *         required: false
 *         type: string
 *       - name: rts_accurate
 *         description: RTS Accurate
 *         in: formData
 *         required: false
 *         type: string
 *       - name: medical_history
 *         description: Medical History
 *         in: formData
 *         required: false
 *         type: string
 *       - name: mh_services_lscft_update
 *         description: MH Services LSCFT Update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: vic_perp_both
 *         description: Vic Perp Both
 *         in: formData
 *         required: false
 *         type: string
 *       - name: location_of_postcode
 *         description: Location of Postcode
 *         in: formData
 *         required: false
 *         type: string
 *       - name: residence_location
 *         description: Residence Location
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Item Registration
 *       400:
 *         description: Bad Request, server doesn't understand input
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing Result
 */
router.post(
    "/create",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            index: { type: "string" },
            date: { type: "string" },
            date_of_birth: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const item = prepareData(req.body);
        RealTimeSurveillance.create(item, (err, data) => {
            if (err) {
                res.status(500).send({ success: false, msg: err });
                return;
            }
            res.send({ success: true, msg: "New incident created", data });
        });
    }
);

/**
 * @swagger
 * /real_time_surveillance/update:
 *   post:
 *     description: Create a new incident
 *     security:
 *      - JWT: []
 *     tags:
 *      - Real Time Surveillance
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: index
 *         description: Index
 *         in: formData
 *         required: true
 *         type: string
 *       - name: ics
 *         description: ICS
 *         in: formData
 *         required: false
 *         type: string
 *       - name: type
 *         description: Type
 *         in: formData
 *         required: false
 *         type: string
 *       - name: method
 *         description: Method
 *         in: formData
 *         required: false
 *         type: string
 *       - name: bcu
 *         description: BCU
 *         in: formData
 *         required: false
 *         type: string
 *       - name: coroner_area
 *         description: Coroner Area
 *         in: formData
 *         required: false
 *         type: string
 *       - name: csp_district
 *         description: CSP District
 *         in: formData
 *         required: false
 *         type: string
 *       - name: ccg
 *         description: CCG
 *         in: formData
 *         required: false
 *         type: string
 *       - name: lancs12
 *         description: Lancs 12
 *         in: formData
 *         required: false
 *         type: string
 *       - name: asc_lcc_update
 *         description: ACS LCC Update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: delphi_update
 *         description: Delphi Update (addition services)
 *         in: formData
 *         required: false
 *         type: string
 *       - name: details
 *         description: Details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: ethnicity
 *         description: Ethnicity
 *         in: formData
 *         required: false
 *         type: string
 *       - name: cgl_update
 *         description: CGL Update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: da
 *         description: Domestic Abuse
 *         in: formData
 *         required: false
 *         type: string
 *       - name: forename
 *         description: Forename
 *         in: formData
 *         required: false
 *         type: string
 *       - name: surname
 *         description: Surname
 *         in: formData
 *         required: false
 *         type: string
 *       - name: csp_resident
 *         description: CSP Resident
 *         in: formData
 *         required: false
 *         type: string
 *       - name: reported_by
 *         description: Reported By
 *         in: formData
 *         required: false
 *         type: string
 *       - name: incident_ref
 *         description: Incident Ref
 *         in: formData
 *         required: false
 *         type: string
 *       - name: date
 *         description: Date
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type_of_location
 *         description: Type of Location
 *         in: formData
 *         required: false
 *         type: string
 *       - name: local_authority
 *         description: Local Authority
 *         in: formData
 *         required: false
 *         type: string
 *       - name: gender
 *         description: Gender
 *         in: formData
 *         required: false
 *         type: string
 *       - name: date_of_birth
 *         description: Date of birth
 *         in: formData
 *         required: true
 *         type: string
 *       - name: occupation
 *         description: Occupation
 *         in: formData
 *         required: false
 *         type: string
 *       - name: type_of_job
 *         description: Type of Job
 *         in: formData
 *         required: false
 *         type: string
 *       - name: employment
 *         description: Employment
 *         in: formData
 *         required: false
 *         type: string
 *       - name: imd_decile
 *         description: IMD Decile
 *         in: formData
 *         required: false
 *         type: string
 *       - name: local
 *         description: Local
 *         in: formData
 *         required: false
 *         type: string
 *       - name: registered_gp_practice
 *         description: Registered GP Practice
 *         in: formData
 *         required: false
 *         type: string
 *       - name: gp_name
 *         description: GP Name
 *         in: formData
 *         required: false
 *         type: string
 *       - name: medication
 *         description: Medication
 *         in: formData
 *         required: false
 *         type: string
 *       - name: bereavement_offered
 *         description: Bereavement Offered
 *         in: formData
 *         required: false
 *         type: string
 *       - name: inquest_conclusion
 *         description: Inquest Conclusion
 *         in: formData
 *         required: false
 *         type: string
 *       - name: inquest_date
 *         description: Inquest Date
 *         in: formData
 *         required: false
 *         type: string
 *       - name: rts_accurate
 *         description: RTS Accurate
 *         in: formData
 *         required: false
 *         type: string
 *       - name: medical_history
 *         description: Medical History
 *         in: formData
 *         required: false
 *         type: string
 *       - name: mh_services_lscft_update
 *         description: MH Services LSCFT Update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: vic_perp_both
 *         description: Vic Perp Both
 *         in: formData
 *         required: false
 *         type: string
 *       - name: location_of_postcode
 *         description: Location of Postcode
 *         in: formData
 *         required: false
 *         type: string
 *       - name: residence_location
 *         description: Residence Location
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Item Registration
 *       400:
 *         description: Bad Request, server doesn't understand input
 *       401:
 *         description: Unauthorised
 *       500:
 *         description: Server Error Processing Result
 */
router.post(
    "/update",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            index: { type: "string" },
            date: { type: "string" },
            date_of_birth: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const item = prepareData(req.body);
        const index = req.body.index;
        const date_of_birth = req.body.date_of_birth;
        delete item.index;
        delete item.date_of_birth;
        RealTimeSurveillance.getByID(index, date_of_birth, function (err, result) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + err,
                });
            } else {
                if (result && result.Items.length > 0) {
                    const keys = { index: index, date_of_birth: date_of_birth };
                    RealTimeSurveillance.update(keys, item, (updateErr, updateResult) => {
                        if (updateErr) {
                            res.status(500).send({ success: false, msg: updateErr });
                            return;
                        }
                        res.send({ success: true, msg: "Incident updated", updateResult });
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        msg: "Failed to find item to update",
                    });
                }
            }
        });
    }
);

/**
 * @swagger
 * /real_time_surveillance/remove:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Removes the Item
 *     tags:
 *      - Real Time Surveillance
 *     produces:
 *      - application/json
 *     parameters:
 *         - in: body
 *           name: incident
 *           description: Incident details.
 *           schema:
 *                type: object
 *                properties:
 *                  index:
 *                     type: string
 *                  date_of_birth:
 *                     type: string
 *     responses:
 *       200:
 *         description: item deleted
 *       404:
 *         description: item not found
 *       500:
 *         description: server error
 */
router.post(
    "/remove",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "body",
        {
            index: { type: "string" },
            date_of_birth: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        const index = req.body.index;
        const date_of_birth = req.body.date_of_birth;
        RealTimeSurveillance.getByID(index, date_of_birth, function (err, result) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Error: " + err,
                });
            } else {
                if (result && result.Items.length > 0) {
                    const keys = {
                        index: index,
                        date_of_birth: date_of_birth,
                    };
                    RealTimeSurveillance.delete(keys, function (removeErr, removeResult) {
                        if (removeErr) {
                            res.status(500).json({
                                success: false,
                                msg: "Error: " + err,
                            });
                        } else {
                            res.status(200).json({
                                success: true,
                                msg: "Item deleted",
                                data: removeResult,
                            });
                        }
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        msg: "Failed to find item to remove",
                    });
                }
            }
        });
    }
);

function prepareData(data) {
    let age;
    if (data.date) {
        age = dateDiffInYears(new Date(data.date_of_birth), new Date(data.date));
    } else {
        age = dateDiffInYears(new Date(data.date_of_birth), new Date());
    }
    if (age) data.age = age;
    return data;
}

function dateDiffInYears(dateold, datenew) {
    const ynew = datenew.getFullYear();
    const mnew = datenew.getMonth();
    const dnew = datenew.getDate();
    const yold = dateold.getFullYear();
    const mold = dateold.getMonth();
    const dold = dateold.getDate();
    let diff = ynew - yold;
    if (mold > mnew) diff--;
    else {
        if (mold === mnew) {
            if (dold > dnew) diff--;
        }
    }
    return diff;
}

module.exports = router;
