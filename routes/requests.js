const uuid = require("uuid");
const express = require("express");
const router = express.Router();
const AWS = require("../config/database").AWS;
const passport = require("passport");

const DIULibrary = require("diu-data-functions");
const usersModel = new DIULibrary.Models.UserModel(AWS);
const verificationCodesModel = new DIULibrary.Models.VerificationCodeModel(AWS);
const formSubmissionsModel = new DIULibrary.Models.FormSubmissionModel(AWS);
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const EmailHelper = DIULibrary.Helpers.Email;
const MessagesHelper = require("../helpers/messages");

const issuer = process.env.SITE_URL || "NHS BI Platform";

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Requests functionality for BI Platform Applications
 */

/**
 * @swagger
 * /requests:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Get all requests
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: type
 *        description: Request type
 *        in: query
 *        type: string
 *      - name: pageKey
 *        description: Start page from item with this key
 *        in: query
 *        type: string
 *     responses:
 *       200:
 *         description: Full List
 */
router.get(
    "/",
    [
        passport.authenticate("jwt", {
            session: false,
        }),
        MiddlewareHelper.userHasCapability("Hall Monitor"),
    ],
    (req, res, next) => {
        formSubmissionsModel.get(req.query, (error, data) => {
            console.log(error, data);
            // Check for save error
            if (error) {
                res.status(500).json({ success: false, msg: error });
                return;
            }

            // Return list
            res.json(data);
        });
    }
);

/**
 * @swagger
 * /requests/account:
 *   post:
 *     description: Send a request for a user account
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: firstname
 *        description: First name
 *        in: formData
 *        required: true
 *        type: string
 *
 *      - name: surname
 *        description: Surname
 *        in: formData
 *        required: true
 *        type: string
 *
 *      - name: professional_role
 *        description: Professional role
 *        in: formData
 *        required: true
 *        type: string
 *
 *      - name: professional_number
 *        description: Professional number
 *        in: formData
 *        required: true
 *        type: string
 *
 *      - name: organisation
 *        description: Organisation name
 *        in: formData
 *        required: true
 *        type: string
 *
 *      - name: request_sponsor
 *        description: Professional number
 *        in: formData
 *        required: true
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *
 *      - name: email
 *        description: Applicant email address
 *        in: formData
 *        required: true
 *        type: string
 *
 *      - name: pid_access
 *        description: Patient identifiabe access?
 *        in: formData
 *        required: true
 *        type: object
 *        properties:
 *          patient_gps:
 *            type: array
 *            items:
 *              type: string
 *          patient_chs:
 *            type: string
 *          citizen_council:
 *            type: string
 *          related_ch:
 *            type: string
 *          related_mdt:
 *            type: string
 *
 *      - name: app_access
 *        type: array
 *        items:
 *          type: string
 *
 *      - name: terms_agreed
 *        type: boolean
 *
 *      - name: date
 *        type: string
 *     responses:
 *       200:
 *         description: Form has been submitted sucessfully
 */
router.post("/account", (req, res, next) => {
    // Get form data
    const formData = req.body;

    // Store form in the database
    const formSubmission = {
        id: uuid.v1(),
        parent_id: null,
        type: "AccountRequest",
        data: {
            firstname: formData.firstname,
            surname: formData.surname,
            email: formData.email,
            professional_role: formData.professional_role,
            professional_number: formData.professional_number,
            organisation: formData.organisation,
            request_sponsor: {
                email: formData.request_sponsor.email,
            },
            pid_access: {
                patient_gps: formData.pid_access.patient_gps,
                patient_chs: formData.pid_access.patient_chs,
                citizen_council: formData.pid_access.citizen_council,
                related_ch: formData.pid_access.related_ch,
                related_mdt: formData.pid_access.related_mdt,
            },
            app_access: formData.app_access,
            approved: null,
        },
        created_at: formData.date,
    };
    formSubmissionsModel.create(formSubmission, (error) => {
        // Check for save error
        if (error) {
            res.status(500).json({ success: false, msg: error });
            return;
        }

        // Delete email verification code
        verificationCodesModel.deleteCode(formData.email_verification_code, formData.email);

        // Send sponsor an email
        EmailHelper.sendMail(
            {
                to: formSubmission.data.request_sponsor.email,
                subject: "COVID 19 Data Hub Access",
                message: `<p>A member of your organisation has requested access to the BI Platform. Details of the request are below...</p>
            ${MessagesHelper.accountRequestTable(formSubmission)}
            <p>Please click below to authorise or deny this request...</p>`,
                actions: [
                    {
                        class: "primary",
                        text: "Approve",
                        type: "account_request_approve",
                        type_params: { id: formSubmission.id },
                    },
                    {
                        class: "warn",
                        text: "Deny",
                        type: "account_request_deny",
                        type_params: { id: formSubmission.id },
                    },
                ],
            },
            (errorSend) => {
                if (errorSend) {
                    console.log("Unable to send authorization request email to: " + formData.email + ". Reason: " + errorSend.toString());
                    res.status(500).json({ success: false, msg: "An error occurred submitting the request" });
                } else {
                    res.status(200).json({ success: false, msg: "Request submitted successfully!" });
                }
            }
        );
    });
});

/**
 * @swagger
 * /requests/account/{id}:
 *   post:
 *     description: Send a request for a user account
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: id
 *        description: Request id
 *        in: path
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 */
router.get("/account/:id", (req, res, next) => {
    formSubmissionsModel.getById(req.params.id, (err, data) => {
        if (err || data.Items.length === 0) {
            res.json({ success: false, msg: "Failed to retrieve request" });
        } else {
            res.json(data.Items[0]);
        }
    });
});

/**
 * @swagger
 * /requests/account/complete:
 *   post:
 *     description: Send a request for a user account
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: parent_id
 *        description: Parent request id
 *        in: formData
 *        required: true
 *        type: string
 *      - name: action
 *        description: Action name
 *        in: formData
 *        required: true
 *        type: string
 *      - name: date
 *        description: Request completion date
 *        in: formData
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 */
router.post("/account/complete", (req, res, next) => {
    // Get form data
    const formData = req.body;

    // Update parent request
    formSubmissionsModel.update(
        formData.parent_id,
        {
            approved: formData.action === "approve",
        },
        (err, userAccessRequest) => {
            // Return error
            if (err) {
                res.status(401).json({ success: false, msg: err });
                return;
            }

            // Deny or approve?
            if (formData.action === "approve") {
                // Store form in the database
                const formSubmission = {
                    id: uuid.v1(),
                    parent_id: formData.parent_id,
                    type: "AccountRequestComplete",
                    data: {
                        action: formData.action,
                        officer: formData.officer,
                        officer_job: formData.officer_job,
                        organisation: formData.organisation,
                    },
                    created_at: formData.date,
                };
                formSubmissionsModel.create(formSubmission, (error) => {
                    if (error) {
                        res.status(500).json({ success: false, msg: error });
                    }
                });

                // Create account
                const userAccount = {
                    name: `${userAccessRequest.data.firstname} ${userAccessRequest.data.surname}`,
                    email: userAccessRequest.data.email,
                    username: userAccessRequest.data.email,
                    password: Math.random().toString(36).slice(-8),
                    organisation: "Collaborative Partners",
                    linemanager: formSubmission.officer,
                };
                usersModel.addUser(AWS.DynamoDB.Converter.marshall(userAccount), userAccount.password, (userAddError, user) => {
                    // Return failed
                    if (userAddError) {
                        res.json({ success: false, msg: "Failed to register user" });
                    }
                });

                // Send user access details
                EmailHelper.sendMail(
                    {
                        to: userAccessRequest.data.email,
                        subject: "NHS BI Platform Access",
                        message: `
                <p>Your access to ${issuer.replace("api.", "")} has been approved, you can now login using the below details...</p>
                <p>
                    <b>Username:</b> ${userAccount.username} <br>
                    <b>Password:</b> ${userAccount.password} <br>
                    <b>Organisation:</b> Collaborative Partners
                </p>
                <p>When you first login please change your password to keep your account secure.</p>`,
                        actions: [
                            {
                                class: "primary",
                                text: "Login",
                                type: "home_page",
                            },
                        ],
                    },
                    (error, response) => {
                        if (error) {
                            console.log("Unable to send approval notification to: " + formData.email + ". Reason: " + error.toString());
                            res.status(500).json({ success: false, msg: error });
                        } else {
                            res.json({ success: false, msg: "Request has been approved!" });
                        }
                    }
                );
            } else {
                // Record form submission
                formSubmissionsModel.create(
                    {
                        id: uuid.v1(),
                        parent_id: formData.parent_id,
                        type: "AccountRequestComplete",
                        data: {
                            action: formData.action,
                            reason: formData.reason,
                        },
                        created_at: formData.date,
                    },
                    (error) => {
                        if (error) {
                            res.status(500).json({ success: false, msg: error });
                        }
                    }
                );

                // Send user details
                EmailHelper.sendMail(
                    {
                        to: userAccessRequest.data.email,
                        subject: "COVID 19 Data Hub",
                        message: `
                <p>Your access to ${issuer.replace("api.", "")} has not been approved.</p>
                <p><b>Reason:</b> ${formData.reason}</p>`,
                        actions: [
                            {
                                class: "primary",
                                text: "Request again",
                                type: "account_request",
                            },
                        ],
                    },
                    (error, response) => {
                        if (error) {
                            console.log("Unable to send approval notification to: " + formData.email + ". Reason: " + error.toString());
                            res.status(500).json({ success: false, msg: error });
                        } else {
                            res.json({ success: false, msg: "Response has been recorded" });
                        }
                    }
                );
            }
        }
    );
});

module.exports = router;
