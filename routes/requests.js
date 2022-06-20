const uuid = require("uuid");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { keyBy, groupBy } = require("lodash");

const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const verificationCodesModel = new DIULibrary.Models.VerificationCodeModel();
const formSubmissionsModel = new DIULibrary.Models.FormSubmissionModel();
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const EmailHelper = DIULibrary.Helpers.Email;
const MsTeamsHelper = DIULibrary.Helpers.MsTeams;
const CapabilitiesModel = new DIULibrary.Models.CapabilityModel();
const RequestsHelper = require("../helpers/requests");

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
 *     description: Get all requests. Requires Hall Monitor
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
 *       401:
 *         description: Unauthorized
 *       403:
 *        description: Forbidden due to capability requirements
 *       500:
 *         description: Internal Server Error
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
 *      - name: email_verification_code
 *        description: Applicants verification code
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
 *      - name: capabilities
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id:
 *              type: string
 *            valuejson:
 *              type: string
 *
 *      - name: terms_agreed
 *        type: boolean
 *
 *      - name: date
 *        type: string
 *        format: date
 *     responses:
 *       200:
 *         description: Form has been submitted sucessfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/account",
    MiddlewareHelper.validate(
        "body",
        {
            email_verification_code: { type: "string" },
            email: { type: "string" },
        },
        {
            pattern: "Missing query params",
        }
    ),
    (req, res, next) => {
        // Get form data
        const formData = req.body;

        // Get capabilities
        CapabilitiesModel.query(
            {
                text: "SELECT * FROM capabilities WHERE id = ANY($1)",
                values: [formData.capabilities.map((item) => item.id)],
            },
            (capabilityQueryError, capabilities) => {
                // Check for error
                if (capabilityQueryError) {
                    res.status(500).json({ success: false, msg: capabilityQueryError });
                    return;
                }

                // Key by id
                capabilities = keyBy(capabilities, (capability) => capability.id);

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
                        pid_access: {
                            patient_gps: formData.pid_access.patient_gps,
                            patient_chs: formData.pid_access.patient_chs,
                            citizen_council: formData.pid_access.citizen_council,
                            related_ch: formData.pid_access.related_ch,
                            related_mdt: formData.pid_access.related_mdt,
                        },
                        capabilities: formData.capabilities.map((capability) => {
                            if (capabilities[capability.id].authoriser == null) {
                                capability.approved = true;
                            } else {
                                capability.approved = null;
                                capability.approved_by = capabilities[capability.id].authoriser;
                            }
                            return capability;
                        }),
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

                    // Group capabilities by authorisers
                    const authorisers = groupBy(Object.values(capabilities), (capability) => capability.authoriser);

                    // Send email to each authoriser
                    Promise.all(
                        Object.keys(authorisers)
                            .filter((authoriser) => authoriser !== "null")
                            .reduce((promises, authoriser, i) => {
                                promises.push(
                                    new Promise((resolve, reject) => {
                                        EmailHelper.sendMail(
                                            {
                                                to: authoriser,
                                                subject: "Nexus BI Platform Access",
                                                message: `
                                    <p>${formData.firstname} ${formData.surname} has requested access to the Nexus BI Platform.</p>
                                    <p>Click below to view further details...</p>`,
                                                actions: [
                                                    {
                                                        class: "primary",
                                                        text: "View Request",
                                                        type: "account_request_action",
                                                        type_params: {
                                                            id: formSubmission.id,
                                                            capabilities: authorisers[authoriser].map((item) => item.id),
                                                        },
                                                    },
                                                ],
                                            },
                                            (errorSend) => {
                                                if (errorSend) {
                                                    console.log(
                                                        "Unable to send authorization request email to: " +
                                                            formData.email +
                                                            ". Reason: " +
                                                            errorSend.toString()
                                                    );
                                                    reject(errorSend);
                                                } else {
                                                    resolve(true);
                                                }
                                            }
                                        );
                                    })
                                );
                                return promises;
                            }, [])
                    ).then(
                        () => {
                            // All emails sent successfully
                            res.status(200).json({ success: true, msg: "Request submitted successfully" });
                        },
                        (errors) => {
                            // Error occurred with email
                            if (errors.length > 0) {
                                res.status(500).json({ success: false, msg: "An error occurred submitting the request" });
                            }
                        }
                    );
                });
            }
        );
    }
);

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
 *       404:
 *         description: Form not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/account/:id", (req, res, next) => {
    formSubmissionsModel.getById(req.params.id, (err, data) => {
        if (err) {
            res.status(500).json({ success: false, msg: "Failed to retrieve request" });
        } else if (data.Items.length === 0) {
            res.status(404).json({ success: false, msg: "Request not found" });
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
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.post("/account/complete", (req, res, next) => {
    // Get form data
    const formData = req.body;

    if (!formData.parent_id || !formData.action || !formData.date) {
        res.status(400).json({ success: false, msg: "Missing params" });
        return;
    }

    // Get parent request
    formSubmissionsModel.getByKeys(
        {
            id: formData.parent_id,
        },
        (getRequestError, userAccessRequests) => {
            // Return error
            if (getRequestError) {
                res.status(500).json({ success: false, msg: getRequestError });
                return;
            }

            // Return error if no items found
            if (userAccessRequests.Items.length === 0) {
                res.status(404).json({ success: false, msg: "Request no longer exists" });
                return;
            }

            // Change approved status of each capability
            const userAccessRequest = userAccessRequests.Items[0];
            const actionedCapabilityIds = formData.capabilities.map((item) => item.id);
            userAccessRequest.data.capabilities = userAccessRequest.data.capabilities.map((capability) => {
                if (capability.approved === null && actionedCapabilityIds.includes(capability.id)) {
                    capability.approved = formData.action === "approve";
                }
                return capability;
            });

            // Check approved status of all capabilities
            userAccessRequest.data.approved = true;
            for (let i = 0; i < userAccessRequest.data.capabilities.length; i++) {
                if (userAccessRequest.data.capabilities[i].approved === null) {
                    userAccessRequest.data.approved = null;
                    break;
                }
            }

            // Store action request
            let formSubmission;
            if (formData.action === "approve") {
                formSubmission = {
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
            } else {
                formSubmission = {
                    id: uuid.v1(),
                    parent_id: formData.parent_id,
                    type: "AccountRequestComplete",
                    data: {
                        action: formData.action,
                        reason: formData.reason,
                    },
                    created_at: formData.date,
                };
            }

            // Persist action submission
            formSubmissionsModel.create(formSubmission, (formSubmissionError) => {
                if (formSubmissionError) {
                    console.log("Form submission error");
                    res.status(500).json({ success: false, msg: formSubmissionError });
                    return;
                }

                // Update parent request
                formSubmissionsModel.update(
                    { id: formData.parent_id },
                    {
                        data: userAccessRequest.data,
                    },
                    (accessRequestError, data) => {
                        if (accessRequestError) {
                            console.log("Access request error", accessRequestError);
                            res.status(500).json({ success: false, msg: accessRequestError });
                            return;
                        }

                        // Manage approval status
                        if (userAccessRequest.data.approved === true) {
                            // Create account
                            const userAccountPassword = Math.random().toString(36).slice(-8);
                            UserModel.create(
                                {
                                    name: `${userAccessRequest.data.firstname} ${userAccessRequest.data.surname}`,
                                    email: userAccessRequest.data.email,
                                    username: userAccessRequest.data.email,
                                    password: userAccountPassword,
                                    organisation: "Collaborative Partners",
                                    linemanager: formSubmission.officer,
                                },
                                (userAddError, user) => {
                                    // Return failed
                                    if (userAddError) {
                                        console.log("User create error");
                                        res.status(500).json({ success: false, msg: "Failed to register user" });
                                        return;
                                    }

                                    // Create links array
                                    RequestsHelper.linkRequestedCapbilities(
                                        user,
                                        userAccessRequest.data.capabilities.filter((capability) => capability.approved)
                                    ).then(
                                        (links) => {
                                            // Send user access details
                                            EmailHelper.sendMail(
                                                {
                                                    to: userAccessRequest.data.email,
                                                    subject: "NHS BI Platform Access",
                                                    message: `
                <p>Your access to ${issuer.replace("api.", "")} has been approved, you can now login using the below details...</p>
                <p>
                    <b>Username:</b> ${user.username} <br>
                    <b>Password:</b> ${userAccountPassword} <br>
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
                                                        console.log(
                                                            "Unable to notify: " + formData.email + ". Reason: " + error.toString()
                                                        );
                                                        res.status(500).json({ success: false, msg: error });
                                                    } else {
                                                        res.json({ success: true, msg: "Your response has been recorded" });
                                                    }
                                                }
                                            );
                                        },
                                        (errors) => {
                                            if (errors.length > 0) {
                                                res.status(500).json({ success: false, msg: "Failed to register user" });
                                            }
                                        }
                                    );
                                }
                            );
                        } else if (userAccessRequest.data.approved === false) {
                            // Send access denied email
                            EmailHelper.sendMail(
                                {
                                    to: userAccessRequest.data.email,
                                    subject: "BI Platform Access",
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
                                        console.log(
                                            "Unable to send approval notification to: " + formData.email + ". Reason: " + error.toString()
                                        );
                                        res.status(500).json({ success: false, msg: error });
                                    } else {
                                        res.json({ success: true, msg: "Response has been recorded" });
                                    }
                                }
                            );
                        } else {
                            // Some capabilities still require approval
                            res.json({ success: true, msg: "Your response has been recorded" });
                        }
                    }
                );
            });
        }
    );
});

/**
 * @swagger
 * /requests/help:
 *   post:
 *     description: Send feedback
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: body
 *        name: Payload
 *        description: Message information
 *        schema:
 *          type: object
 *          required:
 *            - message
 *          properties:
 *            email:
 *              type: string
 *            message:
 *              type: string
 *            attributes:
 *              type: object
 *              patternProperties:
 *                "^.*$":
 *                  type: string
 *
 *     responses:
 *       200:
 *         description: Request received successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.post(
    "/help",
    MiddlewareHelper.validate(
        "body",
        {
            message: { type: "string" },
        },
        {
            pattern: "Please provide us with sufficient information",
        }
    ),
    (req, res, next) => {
        // Get form data
        const formData = req.body;

        // Store form in the database
        const helpRequest = {
            id: uuid.v1(),
            parent_id: null,
            type: "HelpRequest",
            data: {
                email: formData?.email || "unknown",
                message: formData.message,
                attributes: formData.attributes,
            },
            created_at: require("luxon").DateTime.now().toISO(),
        };
        formSubmissionsModel.create(helpRequest, (error) => {
            // Check for save error
            if (error) {
                res.status(500).json({ success: false, msg: error });
                return;
            }

            // Send notification email
            MsTeamsHelper.sendNotification(
                {
                    title: "User Message",
                    message: `
                        New message from a Nexus Intelligence user... \n\n
                        **Email**: ${formData.email} \n\n
                        **Message**: ${formData.message}`,
                    actionButton: {
                        title: "View Request",
                        url: `https://${process.env.SITE_URL}/admin/requests/${encodeURIComponent(helpRequest.id)}`,
                    },
                },
                (errorSend) => {
                    if (errorSend) {
                        console.log("Unable to send notification alert. Reason: " + errorSend.toString());
                        res.status(500).json({ success: false, msg: "An error occurred submitting the request" });
                    } else {
                        res.status(200).json({ success: true, msg: "Request submitted successfully" });
                    }
                }
            );
        });
    }
);

module.exports = router;
