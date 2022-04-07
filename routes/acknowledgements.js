// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const Acks = require("../models/acknowledgements");
const uuid = require("uuid");
const multer = require("multer");
const upload = multer({ dest: __dirname + "/../storage/uploads/" });
const fs = require("fs");
const config = require("../config/database");
const aws = config.AWS;
const s3 = new aws.S3();
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 *   name: Acknowledgements
 *   description: Acknowlegement system for Nexus Intelligence Applications
 */

/**
 * @swagger
 * /acknowledgements/createList:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Creates a new mailing list
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: listname
 *         description: Name of the list
 *         in: formData
 *         required: true
 *         type: string
 *       - name: area
 *         description: Area
 *         in: formData
 *         required: true
 *         type: string
 *       - name: config
 *         description: list configuration
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of List Creation
 */
router.post(
    "/createList",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const newuid = uuid.v1();
        let newItem = {
            uid: { S: newuid },
            listname: { S: req.body.listname },
            area: { S: req.body.area },
            config: { S: JSON.stringify(req.body.config) },
        };

        Acks.createList(newItem, (err, result) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to register: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "List created",
                    uid: newuid,
                });
            }
        });
    }
);

/**
 * @swagger
 * /acknowledgements/updateList:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Updates an existing mailing list
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Unique ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: listname
 *         description: Name of the list
 *         in: formData
 *         required: true
 *         type: string
 *       - name: area
 *         description: Area
 *         in: formData
 *         required: true
 *         type: string
 *       - name: config
 *         description: list configuration
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of List Creation
 */
router.post(
    "/updateList",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        let item = req.body;
        Acks.updateList(item, function (err, data) {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Item updated",
                });
            }
        });
    }
);

/**
 * @swagger
 * /acknowledgements/removeList:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Removes an existing mailing list
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Unique ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: listname
 *         description: Name of the list
 *         in: formData
 *         required: true
 *         type: string
 *       - name: area
 *         description: Area
 *         in: formData
 *         required: true
 *         type: string
 *       - name: config
 *         description: list configuration
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of List Creation
 */
router.post(
    "/removeList",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        let item = req.body;
        Acks.removeList(item.uid, item.listname, function (err, data) {
            if (err) {
                res.json({
                    success: false,
                    msg: "Failed to remove: " + err,
                });
            } else {
                res.json({
                    success: true,
                    msg: "Item removed",
                });
            }
        });
    }
);

/**
 * @swagger
 * /acknowledgements/getList?uid={uid}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Unique ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getList",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const code = req.query.uid.toString();
        Acks.getList(code, function (err, result) {
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
 * /acknowledgements/getAllLists:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getAllLists",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        Acks.getAllLists(function (err, result) {
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
 * /acknowledgements/confirmack?uid={uid}&docid={docid}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Unique ID
 *         in: query
 *         type: string
 *       - name: docid
 *         description: Document ID
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get("/confirmack", (req, res, next) => {
    let uid = req.query.uid.toString();
    let docid = req.query.docid.toString();
    if (uid && docid) {
        Acks.confirmAcknowledgementForDoc(uid, docid, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send("Thank you for reviewing the document. Your signature has now been digitally added to the sign up sheet. You can now close this window.");
            }
        });
    } else {
        res.status(400).send("Bad request, please click the link provided in the email.");
    }
});

/**
 * @swagger
 * /acknowledgements/getAllDocs:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getAllDocs",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        Acks.listDocs(function (err, result) {
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
 * /acknowledgements/getAllAcknowledgements:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/getAllAcknowledgements",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        Acks.getAllAcknowledgements(function (err, result) {
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
 * /acknowledgements/listAcknowledgementsForDoc?docuid={docuid}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: uid
 *         description: Unique ID
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/listAcknowledgementsForDoc",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res, next) => {
        const docuid = req.query.docuid.toString();
        Acks.listAcknowledgementsForDoc(docuid, function (err, result) {
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
 * /acknowledgements/uploadDocument?area=={area}:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Saves a File to the Database
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: file0
 *         description: File
 *         in: formData
 *         required: true
 *         type: file
 *       - name: area
 *         description: Area
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of File Storage
 */
router.post(
    "/uploadDocument",
    passport.authenticate("jwt", {
        session: false,
    }),
    // @ts-ignore
    upload.single("file0"),
    (req, res, next) => {
        const auth = req.headers["authorization"];
        const decoded = jwt.decode(auth.replace("JWT ", ""));
        // @ts-ignore
        if (!req.file || Object.keys(req.file).length === 0) {
            res.status(400).send({ err: "No files were uploaded." });
        } else {
            // @ts-ignore
            let sampleFile = req.file;
            const filename = sampleFile.originalname;
            fs.rename(sampleFile.path, filename, (err) => {
                fs.readFile(filename, function (err, data) {
                    let newbucketParams = {
                        Bucket: config.settings.AWS_BUCKET_NAME,
                        Key: filename,
                        Body: data,
                    };
                    // @ts-ignore
                    s3.putObject(newbucketParams, (errS3, data2) => {
                        fs.unlink(filename, (errDel) => {
                            if (errDel) {
                                console.log("ERROR: " + filename + " was not deleted.Reason: " + errDel);
                            }
                        });
                        if (errS3) {
                            console.error("Item not added to S3, error: " + errS3);
                            res.json({
                                success: false,
                                msg: "Failed to register: " + errS3,
                            });
                        } else {
                            const uid = uuid.v1();
                            const newDoc = {
                                uid: { S: uid },
                                s3filename: { S: filename },
                                uploadDT: { S: new Date().toISOString() },
                                author: { S: decoded["username"] },
                                area: { S: req.query.area || decoded["organisation"] },
                            };
                            Acks.createDoc(newDoc, (errDoc, resDoc) => {
                                if (errDoc) {
                                    console.error("Item added to S3 but not saved in Database, error: " + errDoc.toString());
                                    res.json({
                                        success: false,
                                        msg: "Failed to register: " + errDoc,
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        msg: "Registered",
                                        uid: uid,
                                        s3filename: filename,
                                    });
                                }
                            });
                        }
                    });
                });
            });
        }
    }
);

/**
 * @swagger
 * /acknowledgements/mailListOfAcknowledgementsForDoc:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Sends out emails to a mailing list with the document
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     consumes:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The role link data
 *        schema:
 *          type: object
 *          required:
 *            - documentinfo
 *            - maillist
 *          properties:
 *            documentinfo:
 *              type: object
 *              properties: 
 *                uid:
 *                  type: string
 *                s3filename:
 *                  type: string
 *            maillist:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  username:
 *                    type: string
 *                  org:
 *                    type: string
 *                  email:
 *                    type: string
 *     responses:
 *       200:
 *         description: Confirmation of File Storage
 */
router.post(
    "/mailListOfAcknowledgementsForDoc",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        let item = req.body;
        let documentinfo = item.documentinfo;
        let maillist = item.maillist;
        const params = {
            Bucket: config.settings.AWS_BUCKET_NAME,
            Key: documentinfo.s3filename,
        };
        s3.getObject(params, (fetchErr, fetchResult) => {
            if (fetchErr) {
                res.json({
                    success: false,
                    msg: "Failed to fetch document: " + fetchErr,
                });
            } else {
                var tempFilePath = __dirname + "/../storage/uploads/" + documentinfo.s3filename;
                fs.writeFileSync(tempFilePath, fetchResult.Body);
                const attachment = {
                    path: tempFilePath,
                    filename: documentinfo.s3filename,
                };
                Acks.mailListOfAcknowledgementsForDoc(maillist, attachment, documentinfo, (mailErr, mailResult) => {
                    fs.unlink(tempFilePath, (errDel) => {
                        if (errDel) {
                            console.log("ERROR: " + tempFilePath + " was not deleted.Reason: " + errDel);
                        }
                    });
                    if (mailErr) {
                        res.json({
                            success: false,
                            msg: "Failed to update: " + mailErr,
                        });
                    } else {
                        res.json({
                            success: true,
                            msg: "Emails sent",
                        });
                    }
                });
            }
        });
    }
);

/**
 * @swagger
 * /acknowledgements/downloadDocument?s3filename={s3filename}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - Acknowledgements
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: s3filename
 *         description: Filename
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/downloadDocument",
    passport.authenticate("jwt", {
        session: false,
    }),
    (req, res) => {
        const fileKey = req.query.s3filename;
        const options = {
            Bucket: config.settings.AWS_BUCKET_NAME,
            Key: fileKey,
        };

        s3.getObject(options, (err, result) => {
            if (err) {
                console.error("Error retrieving file. Error: " + err);
                res.status(400).send({ success: false });
                return;
            } else {
                res.attachment(fileKey);
                var fileStream = s3.getObject(options).createReadStream();
                fileStream.pipe(res);
            }
        });
    }
);

module.exports = router;
