// @ts-check

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Profiles = require("../models/userprofiles");
const JWT = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const UserProfileModel = new DIULibrary.Models.UserProfileModel();
const OrganisationModel = new DIULibrary.Models.OrganisationModel();
const ADModel = require("../models/activedirectory");
const ActiveDirectoryModel = new ADModel();
const MiddlewareHelper = DIULibrary.Helpers.Middleware;

/**
 * @swagger
 * tags:
 *   name: UserProfiles
 *   description: Profiles of this type
 */

/**
 * @swagger
 * /userprofiles/create:
 *   post:
 *     security:
 *      - JWT: []
 *     description: Registers a new Profile
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: User Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: photobase64
 *         description: Photo Base64 Image
 *         in: formData
 *         type: string
 *       - name: contactnumber
 *         description: user contact number
 *         in: formData
 *         type: string
 *       - name: preferredcontactmethod
 *         description: Preferred Contact Methods
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: mobiledeviceids
 *         description: Associated Mobile Devices
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: emailpreference
 *         description: Email preference Setting
 *         in: formData
 *         type: string
 *       - name: impreference
 *         description: Instant Messaging preference Setting
 *         in: formData
 *         type: string
 *       - name: im_id
 *         description: Instant Messaging ID
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of new Profile Registration
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
            username: { type: "string", pattern: "[A-z. 0-9]{1,50}#[A-z. ]{1,50}" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        Profiles.addUserProfile(
            {
                username: req.body.username,
                ...(req.body.preferredcontactmethod && { preferredcontactmethod: req.body.preferredcontactmethod }),
                ...(req.body.mobiledeviceids && { mobiledeviceids: req.body.mobiledeviceids }),
                ...(req.body.photobase64 && { photobase64: req.body.photobase64 }),
                ...(req.body.contactnumber && { contactnumber: req.body.contactnumber }),
                ...(req.body.emailpreference && { emailpreference: req.body.emailpreference }),
                ...(req.body.impreference && { impreference: req.body.impreference }),
                ...(req.body.im_id && { im_id: req.body.im_id }),
            },
            (err, data) => {
                if (err) {
                    res.status(500).json({ success: false, msg: "Failed to register: " + err });
                } else {
                    res.json({ success: true, msg: "Registered", _id: data["_id"], data });
                }
            }
        );
    }
);

/**
 * @swagger
 * /userprofiles/:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the entire collection
 *     tags:
 *      - UserProfiles
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
        Profiles.getAll(function (err, result) {
            if (err) {
                res.status(500).send({ success: false, msg: err });
            } else {
                if (result.Items) {
                    res.send(JSON.stringify(result.Items));
                } else {
                    res.send(JSON.stringify([]));
                }
            }
        });
    }
);

// TODO: Switch from /userprofiles/username/{username} to /userprofiles/{userId}
/**
 * @swagger
 * /userprofiles/username/{username}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the profile for a User *TO BE DEPRECATED*
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: Unique Username
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full List
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.get(
    "/username/:username",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "params",
        {
            username: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        let org = "global";
        const username = req.body.username;
        if (req.header("authorization")) {
            const decodedToken = JWT.decode(req.header("authorization").replace("JWT ", ""));
            if (decodedToken["authentication"] === "nwas") {
                org = decodedToken["authentication"];
            }
        }

        // Find organisation details
        OrganisationModel.get({ authmethod: org }, (err, data) => {
            // Error?
            if (err) {
                res.status(500).send({ success: false, message: err });
                return;
            }

            // Organisation exists?
            if (data.Items.length === 0) {
                res.status(404).send({ status: 404, message: "Organisation not found" });
                return;
            }

            // Query via active directory
            const organisation = data.Items[0];
            ActiveDirectoryModel.getInstance(organisation.authmethod, (errGetInstance, activeDirectory) => {
                if (errGetInstance) {
                    res.status(500).send({ success: false, message: errGetInstance });
                    return;
                }
                Profiles.getUserProfileByUsername(username, function (errUserProfile, result) {
                    if (errUserProfile) {
                        res.status(500).send({ success: false, msg: errUserProfile });
                        return;
                    }
                    if (result.Items.length > 0) {
                        UserModel.getUserByUsername(username, function (err2, result2) {
                            if (err2) {
                                res.status(500).send({ success: false, msg: err2 });
                            } else {
                                if (result2.Items.length === 0) {
                                    // @ts-ignore
                                    activeDirectory.findUser(username, function (errFindUser, user) {
                                        if (errFindUser) {
                                            return res.status(500).json({
                                                success: false,
                                                err: JSON.stringify(errFindUser),
                                                msg: "User not found",
                                            });
                                        }

                                        if (!user) {
                                            // check if referral org (AD)
                                            return res.status(400).json({
                                                success: false,
                                                msg: "User: " + username + " not found.",
                                            });
                                        } else {
                                            const orguser = {
                                                _id: result.Items[0]["id"],
                                                name: user.cn,
                                                username: user.sAMAccountName,
                                                email: user.mail,
                                                organisation: organisation.name,
                                                photobase64: result.Items[0].photobase64,
                                                contactnumber: result.Items[0].contactnumber,
                                                preferredcontactmethod: result.Items[0].preferredcontactmethod,
                                                mobiledeviceids: result.Items[0].mobiledeviceids,
                                                emailpreference: result.Items[0].emailpreference,
                                                impreference: result.Items[0].impreference,
                                                im_id: result.Items[0].im_id,
                                            };
                                            res.send(orguser);
                                        }
                                    });
                                } else {
                                    const founduser = result2.Items[0];
                                    const fulluser = {
                                        _id: result.Items[0]["id"],
                                        name: founduser.name,
                                        username,
                                        email: founduser.email,
                                        organisation: founduser.organisation,
                                        photobase64: result.Items[0].photobase64,
                                        contactnumber: result.Items[0].contactnumber,
                                        preferredcontactmethod: result.Items[0].preferredcontactmethod,
                                        mobiledeviceids: result.Items[0].mobiledeviceids,
                                        emailpreference: result.Items[0].emailpreference,
                                        linemanager: founduser.linemanager,
                                        impreference: result.Items[0].impreference,
                                        im_id: result.Items[0].im_id,
                                    };
                                    res.send(fulluser);
                                }
                            }
                        });
                    } else {
                        // @ts-ignore
                        activeDirectory.findUser(username, function (errFindingUser, user) {
                            if (errFindingUser) {
                                return res.status(500).json({
                                    success: false,
                                    err: JSON.stringify(errFindingUser),
                                    msg: "User not found",
                                });
                            }

                            if (!user) {
                                // check if referral org (AD)
                                return res.status(400).json({
                                    success: false,
                                    msg: "User: " + username + " not found.",
                                });
                            } else {
                                const ADuser = {
                                    _id: user.employeeID,
                                    name: user.cn,
                                    username: user.sAMAccountName,
                                    email: user.mail,
                                    organisation: organisation.name,
                                    photobase64: null,
                                    contactnumber: null,
                                    preferredcontactmethod: null,
                                    mobiledeviceids: null,
                                    emailpreference: null,
                                    impreference: null,
                                    im_id: null,
                                };
                                res.send(ADuser);
                            }
                        });
                    }
                });
            });
        });
    }
);

/**
 * @swagger
 * /userprofiles/{userId}:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns the profile for a User
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: userId
 *        description: Username#Organisation
 *        type: string
 *        in: path
 *     responses:
 *       200:
 *         description: The user's profile
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal error
 */
router.get(
    "/:userId",
    passport.authenticate("jwt", {
        session: false,
    }),
    MiddlewareHelper.validate(
        "params",
        {
            userId: { type: "string", pattern: "[A-z. 0-9]{1,50}#[A-z. ]{1,50}" },
        },
        {
            pattern: "The user id should be in the format of 'username#organisation'",
        }
    ),
    (req, res, next) => {
        const username = req.params.userId.split("#")[0];

        OrganisationModel.get({ name: req.params.userId.split("#")[1] }, (err, data) => {
            // Error?
            if (err) {
                res.status(500).send({ success: false, message: err });
                return;
            }

            // Organisation exists?
            if (data.Items.length === 0) {
                res.status(404).send({ status: 404, message: "Organisation not found" });
                return;
            }

            // Set organisation
            const organisation = data.Items[0];

            // Get the user's profile
            UserModel.getByKeys(
                {
                    username,
                    organisation: organisation.name,
                },
                (errGetKeys, users) => {
                    // Error?
                    if (errGetKeys) {
                        res.status(500).json({ success: false, msg: errGetKeys.message });
                        return;
                    }

                    // Found user?
                    if (users.Items.length > 0) {
                        // Get user profile
                        const user = users.Items[0];
                        UserProfileModel.getByUsername(username, (errGetUsername, profiles) => {
                            // Error?
                            if (errGetUsername) {
                                res.status(500).json({ success: false, msg: errGetUsername.message });
                                return;
                            }

                            // Return profile
                            const userprofile = profiles.Items.length === 0 ? null : profiles.Items[0];
                            res.send({
                                _id: userprofile ? userprofile["_id"] : user["_id"],
                                name: user.name,
                                email: user.email,
                                username: user.username,
                                organisation: organisation.name,
                                photobase64: userprofile ? userprofile.photobase64 : "",
                                contactnumber: userprofile ? userprofile.contactnumber : "",
                                preferredcontactmethod: userprofile ? userprofile.preferredcontactmethod : [],
                                mobiledeviceids: userprofile ? userprofile.mobiledeviceids : [],
                                emailpreference: userprofile ? userprofile.emailpreference : [],
                                impreference: userprofile ? userprofile.impreference : [],
                                im_id: userprofile ? userprofile.im_id : "",
                            });
                        });
                    } else {
                        // Resort to AD user
                        ActiveDirectoryModel.getInstance(organisation.authmethod, (getInstanceError, activeDirectory) => {
                            // Organisation has already been checked, username and org combination must be incorrect
                            if (getInstanceError === "Unknown organisation") {
                                res.status(404).send({ success: false, message: "User not found" });
                                return;
                            }

                            // Other error?
                            if (getInstanceError) {
                                res.status(500).send({ success: false, message: getInstanceError });
                                return;
                            }

                            // Find user in active directory
                            activeDirectory.findUser(username, (errFUser, user) => {
                                if (errFUser) {
                                    return res.status(500).json({ success: false, err: JSON.stringify(errFUser), msg: "User not found" });
                                }

                                // User found?
                                if (user) {
                                    UserProfileModel.getByUsername(username, (errGetByUsername, profiles) => {
                                        // Error?
                                        if (errGetByUsername) {
                                            res.status(500).json({ success: false, msg: errGetByUsername.message });
                                            return;
                                        }

                                        // Return profile
                                        const userprofile = profiles.Items.length === 0 ? null : profiles.Items[0];
                                        res.send({
                                            _id: userprofile ? userprofile["_id"] : user.employeeID,
                                            name: user.cn,
                                            email: user.mail,
                                            username: user.sAMAccountName,
                                            organisation: organisation.name,
                                            photobase64: userprofile ? userprofile.photobase64 : "",
                                            contactnumber: userprofile ? userprofile.contactnumber : "",
                                            preferredcontactmethod: userprofile ? userprofile.preferredcontactmethod : [],
                                            mobiledeviceids: userprofile ? userprofile.mobiledeviceids : [],
                                            emailpreference: userprofile ? userprofile.emailpreference : [],
                                            impreference: userprofile ? userprofile.impreference : [],
                                            im_id: userprofile ? userprofile.im_id : "",
                                        });
                                    });
                                } else {
                                    return res.status(400).json({ success: false, msg: "User: " + username + " not found." });
                                }
                            });
                        });
                    }
                }
            );
        });
    }
);

/**
 * @swagger
 * /userprofiles/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Removes a Profile
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Profile's ID
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Member being Archived
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
            id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const id = req.body.id;
        Profiles.getUserProfileById(id, function (err, scan) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to archive: " + err,
                });
            }
            if (scan.Items.length > 0) {
                const profile = scan.Items[0];
                Profiles.remove(profile, function (profileRemoveErr) {
                    if (profileRemoveErr) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to remove: " + profileRemoveErr,
                        });
                    }
                    res.json({
                        success: true,
                        msg: "Profile removed",
                    });
                });
            } else {
                res.status(404).json({
                    success: false,
                    msg: "Unable to find item in database",
                });
            }
        });
    }
);

/**
 * @swagger
 * /userprofiles/update:
 *   put:
 *     security:
 *      - JWT: []
 *     description: Updates a Profile
 *     tags:
 *      - UserProfiles
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: profile_id
 *         description: Profile's ID
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: User Name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: photobase64
 *         description: Photo Base64 Image
 *         in: formData
 *         type: string
 *       - name: contactnumber
 *         description: user contact number
 *         in: formData
 *         type: string
 *       - name: preferredcontactmethod
 *         description: Preferred Contact Methods
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: mobiledeviceids
 *         description: Associated Mobile Devices
 *         in: formData
 *         type: array
 *         items:
 *              type: string
 *       - name: emailpreference
 *         description: Email preference Setting
 *         in: formData
 *         type: string
 *       - name: impreference
 *         description: Instant Messaging preference Setting
 *         in: formData
 *         type: string
 *       - name: im_id
 *         description: Instant Messaging ID
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of App Registration
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
            profile_id: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res) => {
        const id = req.body.profile_id;
        Profiles.getUserProfileById(id, function (err, result) {
            if (err) {
                res.status(500).json({
                    success: false,
                    msg: "Failed to update: " + err,
                });
            }
            if (result.Items.length > 0) {
                const profile = result.Items[0];
                if (req.body.photobase64) profile.photobase64 = req.body.photobase64;
                if (req.body.contactnumber) profile.contactnumber = req.body.contactnumber;
                if (req.body.preferredcontactmethod) profile.preferredcontactmethod = req.body.preferredcontactmethod;
                if (req.body.mobiledeviceids) profile.mobiledeviceids = req.body.mobiledeviceids;
                if (req.body.emailpreference) profile.emailpreference = req.body.emailpreference;
                if (req.body.impreference) profile.impreference = req.body.impreference;
                if (req.body.im_id) profile.im_id = req.body.im_id;

                Profiles.updateUserProfile(profile, function (errUpdate) {
                    if (errUpdate) {
                        res.status(500).json({
                            success: false,
                            msg: "Failed to update: " + errUpdate,
                        });
                    }
                    res.json({
                        success: true,
                        msg: "Install updated",
                        data: profile,
                    });
                });
            } else {
                res.status(404).json({
                    success: false,
                    msg: "Can not find item in database",
                });
            }
        });
    }
);

module.exports = router;
