// @ts-check

const express = require("express");
const router = express.Router();
const credentials = require("../_credentials/credentials");
const jwt = require("jsonwebtoken");
const SimpleCrypto = new (require("simple-crypto-js").default)(credentials.secretkey);

// TODO: Update group to pull key from Secrets Manager
const securegroup = [
    {
        org: "ANY",
        key: "SERVICEACCOUNTKEYHERE",
    },
];

/**
 * @swagger
 * tags:
 *   name: ServiceAccounts
 *   description: Service Account management
 */

/**
 * @swagger
 * /serviceaccounts/check:
 *   post:
 *     description: Checks your service account info
 *     tags:
 *      - ServiceAccounts
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: org
 *         description: Organisation's UNID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: key
 *         description: Organisation's key.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post("/check", (req, res, next) => {
    if (req.body.org && req.body.key) {
        if (securegroup.find((x) => x.org === req.body.org && x.key === req.body.key)) {
            const servicepayload = {
                organisation: req.body.org,
                key: SimpleCrypto.encrypt(req.body.key),
                username: "serviceaccount",
            };
            const key = jwt.sign(servicepayload, credentials.secret, {
                expiresIn: 604800 * 52, // 52 week
            });
            res.status(200).json({ msg: key });
        } else {
            res.status(401).json({ msg: "Key not found" });
        }
    } else {
        res.status(400).json({ msg: "Unable to parse Key" });
    }
});

module.exports = router;
