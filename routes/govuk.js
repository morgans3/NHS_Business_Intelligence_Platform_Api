// @ts-check
const express = require("express");
const router = express.Router();
const DIULibrary = require("diu-data-functions");
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const CredentialsModel = new DIULibrary.Models.CredentialModel();
const GovUkModel = new DIULibrary.Models.GovUkModel();

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
 *       500:
 *         description: Internal Server Error
 */
router.post("/callback", MiddlewareHelper.authenticateWithKey(process.env.GOVUKKEY), (req, res) => {
    const item = req.body;
    GovUkModel.update(item, (err, result) => {
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
 *       500:
 *         description: Internal Server Error
 */
router.post("/maincallback", MiddlewareHelper.authenticateWithKey(process.env.GOVUKKEY), (req, res) => {
    // TODO: store the govuk settings in the API settings and configure the API to use the govuk settings
    CredentialsModel.getByKeys(
        {
            type: "GovUkService",
            name: "bth-staff-covid-test-results",
        },
        (err, result) => {
            if (err) {
                res.status(500).json({ success: true, msg: err });
            }
            GovUkModel.updateGeneral(result.Items[0], req.body, (updateError) => {
                if (updateError) console.error(updateError);
                res.json({ success: true, msg: "Receipt recorded" });
            });
        }
    );
});

module.exports = router;
