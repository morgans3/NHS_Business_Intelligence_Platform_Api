// @ts-check
const express = require("express");
const router = express.Router();
const { server_authenticate } = require("../config/passport-key");
const govukreceipt = require("../models/govukreceipt");
const { MainServices } = require("../_credentials/govuk_info");
/**
 * @swagger
 * tags:
 *   name: GovUKNotify
 *   description: Virtual Wards functions
 */

/**
 * @swagger
 * /govuk/callback:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Delivery ACK from Gov UK Notify
 *     tags:
 *      - GovUKNotify
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: params
 *         description: Response params
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Notifciation Update
 */
router.post("/callback", server_authenticate, (req, res) => {
    let item = req.body;
    govukreceipt.update(item, (err, result) => {
        if (err) console.error(err);
        res.json({
            success: true,
            msg: "Receipt recorded",
        });
    });
});

/**
 * @swagger
 * /govuk/maincallback:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Delivery ACK from Gov UK Notify
 *     tags:
 *      - GovUKNotify
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: params
 *         description: Response params
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Notifciation Update
 */
router.post("/maincallback", server_authenticate, (req, res) => {
    let item = req.body;
    const service = MainServices[0]; // TODO: change to select from multiple services
    govukreceipt.updateGeneral(service, item, (err, result) => {
        if (err) console.error(err);
        res.json({
            success: true,
            msg: "Receipt recorded",
        });
    });
});

module.exports = router;
