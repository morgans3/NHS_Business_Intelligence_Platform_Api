const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { uniq } = require("lodash");

const credentials = require("../_credentials/credentials");
const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const verificationCodesModel = new DIULibrary.Models.VerificationCodeModel();
const formSubmissionsModel = new DIULibrary.Models.FormSubmissionModel();
const MiddlewareHelper = DIULibrary.Helpers.Middleware;
const EmailHelper = DIULibrary.Helpers.Email;
const MsTeamsHelper = DIULibrary.Helpers.MsTeams;
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
 * /requests/{id}:
 *   post:
 *     description: Get request by id
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
router.get("/:id", (req, res, next) => {
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
 *        description: Sponsor to approve account
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
 *      - name: roles
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id:
 *              type: string
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
    async (req, res, next) => {
        try {
            // Get form data
            const formData = req.body;

            // Store request
            const formSubmission = await new Promise((resolve, reject) => {
                // Store form in the database
                const formSubmissionData = {
                    id: uuid.v1(),
                    parent_id: null,
                    type: "AccountRequest",
                    data: {
                        firstname: formData.firstname,
                        surname: formData.surname,
                        email: formData.email,
                        request_sponsor: formData.request_sponsor,
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
                        roles: formData.roles,
                        capabilities: formData.capabilities,
                        approved: null,
                    },
                    created_at: formData.date,
                };
                formSubmissionsModel.create(formSubmissionData, (error) => {
                    // Check for save error
                    if (error) {
                        reject(error);
                    } else {
                        resolve(formSubmissionData);
                    }
                });
            });

            // Delete email verification code
            verificationCodesModel.deleteCode(formData.email_verification_code, formData.email);

            // Send email to sponsor
            EmailHelper.sendMail(
                {
                    to: formData.request_sponsor.email,
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
                                token: jwt.sign(
                                    {
                                        parent_id: formSubmission.id,
                                        email: formData.email
                                    }, credentials.secret, { expiresIn: 5184000 } // 5184000 = 60 days
                                ),
                                expiry: new Date(new Date().getTime() + 5184000000).toISOString()
                            }
                        },
                    ],
                },
                (errorSend) => {
                    if (errorSend) {
                        throw new Error(
                            "Unable to send authorization request email to: " + formData.request_sponsor.email +
                            ". Reason: " + errorSend.toString()
                        );
                    } else {
                        res.status(200).json({ success: true, msg: "Request submitted successfully" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ success: false, msg: error.toString() || "An error occurred submitting the request" });
        }
    }
);

/**
 * @swagger
 * /requests/account/complete:
 *   post:
 *     description: Complete a request for a user account
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: token
 *        description: The token for authentication the sponsor
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
router.post("/account/complete", async (req, res, next) => {
    try {
        // Get form data
        let formData = req.body;
        if (!formData.token || !formData.action || !formData.date) {
            res.status(400).json({ success: false, msg: "Missing params" });
            return;
        }

        // Read jwt
        formData = Object.assign({}, formData, jwt.decode(formData.token));

        // Store request
        const userAccessRequest = await new Promise((resolve, reject) => {
            // Get parent request
            formSubmissionsModel.getByKeys(
                {
                    id: formData.parent_id,
                },
                (getRequestError, userAccessRequests) => {
                    // Return error
                    if (getRequestError) {
                        reject(getRequestError);
                        return;
                    }

                    // Return error if no items found
                    if (userAccessRequests.Items.length === 0) {
                        reject(new Error("Request no longer exists"));
                        return;
                    }

                    // Get request
                    resolve(userAccessRequests.Items[0]);
                }
            );
        });

        // Store approval complete
        await new Promise((resolve, reject) => {
            // Store action request
            let completionRequestData;
            if (formData.action === "approve") {
                completionRequestData = {
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
                completionRequestData = {
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
            formSubmissionsModel.create(completionRequestData, (completionRequestError) => {
                if (completionRequestError) {
                    reject(completionRequestError);
                } else {
                    resolve(completionRequestData);
                }
            });
        });

        // Set parent request approval status
        userAccessRequest.data.approved = (formData.action === "approve");

        // Update parent request
        await new Promise((resolve, reject) => {
            formSubmissionsModel.update(
                { id: formData.parent_id },
                {
                    data: userAccessRequest.data,
                },
                (accessRequestError, data) => {
                    if (accessRequestError) {
                        reject(accessRequestError);
                    } else {
                        resolve();
                    }
                }
            );
        });

        // Create user account
        const user = await new Promise((resolve, reject) => {
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
                        linemanager: formData.officer,
                    },
                    (userAddError, newUser) => {
                        // Return failed
                        if (userAddError) {
                            console.log(userAddError);
                            reject(new Error("Failed to register user"));
                        }

                        // Send user access details
                        EmailHelper.sendMail(
                            {
                                to: userAccessRequest.data.email,
                                subject: "NHS BI Platform Access",
                                message: `
    <p>Your access to ${issuer.replace("api.", "")} has been approved, you can now login using the below details...</p>
    <p>
        <b>Username:</b> ${userAccessRequest.data.email} <br>
        <b>Password:</b> ${userAccountPassword} <br>
        <b>Organisation:</b> Collaborative Partners
    </p>
    <p>When you first login please change your password to keep your account secure.</p>
    <p>If you requested access to restricted features of Nexus (roles/capabilities) these may still be awaiting approval,
    you'll receive an email once each feature has been granted.</p>`,
                                actions: [
                                    {
                                        class: "primary",
                                        text: "Login",
                                        type: "home_page",
                                    },
                                ],
                            },
                            (error) => {
                                if (error) {
                                    console.log("Unable to notify: " + formData.email + ". Reason: " + error.toString());
                                    reject(error);
                                } else {
                                    resolve(newUser);
                                }
                            }
                        );
                    }
                );
            } else {
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
                            reject(error);
                        } else {
                            resolve(null);
                        }
                    }
                );
            }
        });

        // Request capabilities?
        if (user) {
            const permissionsRequestResponse = await requestPermissionsRoute({
                user_id: `${user.username}#${user.organisation}`,
                capabilities: userAccessRequest.data.capabilities,
                roles: userAccessRequest.data.roles,
                date: new Date().toISOString(),
            });
            if (!permissionsRequestResponse.success) {
                res.status(permissionsRequestResponse.status).json({
                    success: false,
                    msg: permissionsRequestResponse.msg || "An error occurred submitting the request"
                });
                return;
            }
        }

        // Check user
        res.json({ success: true, msg: "Response has been recorded" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: error.toString() || "An error occurred submitting the request" });
    }
});

/**
 * @swagger
 * /requests/permissions:
 *   post:
 *     description: Send a request for a user account
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: user_id
 *        description: Username#Organisation
 *        in: formData
 *        required: true
 *        type: string
 *      - name: roles
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id:
 *              type: string
 *      - name: capabilities
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id:
 *              type: string
 *            valuejson:
 *              type: string
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
const requestPermissionsRoute = async (formData) => {
    try {
        // Get request user
        const user = await new Promise((resolve, reject) => {
            UserModel.getByKeys(
                {
                    username: formData.user_id.split("#")[0],
                    organisation: formData.user_id.split("#")[1],
                },
                (err, result) => {
                    if (err) { reject(err); }
                    if (result.Items.length === 0) {
                        reject(new Error("User not found"));
                    } else {
                        resolve(result.Items[0]);
                    }
                }
            );
        });

        // Get capabilities
        const capabilities = await RequestsHelper.getRequestedCapabilities(
            formData.capabilities.map((item) => item.id)
        );

        // Get roles
        const roles = await RequestsHelper.getRequestedRoles(
            formData.roles.map((item) => item.id)
        );

        // Create form submission
        const permissionRequest = await new Promise((resolve, reject) => {
            const formSubmissionData = {
                id: uuid.v1(),
                parent_id: null,
                type: "PermissionRequest",
                data: {
                    user_id: formData.user_id,
                    user: {
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        organisation: user.organisation
                    },
                    roles: formData.roles.map((role) => {
                        if (roles[role.id].authoriser == null) {
                            role.approved = true;
                        } else {
                            role.approved = null;
                            role.approved_by = roles[role.id].authoriser;
                        }
                        return role;
                    }),
                    capabilities: formData.capabilities.map((capability) => {
                        if (capabilities[capability.id].authoriser == null) {
                            capability.approved = true;
                        } else {
                            capability.approved = null;
                            capability.approved_by = capabilities[capability.id].authoriser;
                        }
                        return capability;
                    }),
                    completed: null
                },
                created_at: formData.date
            };
            formSubmissionsModel.create(formSubmissionData, (formSubmissionError) => {
                // Check for save error
                if (formSubmissionError) {
                    reject(formSubmissionError);
                } else {
                    resolve(formSubmissionData);
                }
            });
        });

        // Add permissions that don't require authoriser
        const authorisedPermissions = (
            await RequestsHelper.linkRequestedRoles(
                user,
                permissionRequest.data.roles.filter((role) => role.approved)
            )
        ).concat(
            await RequestsHelper.linkRequestedCapbilities(
                user,
                permissionRequest.data.capabilities.filter((capability) => capability.approved)
            )
        );

        // Send user email detailing approved permissions
        if (authorisedPermissions.length > 0) {
            await new Promise((resolve, reject) => {
                RequestsHelper.emailPermissionsRequestStatus({
                    user,
                    permissions: authorisedPermissions.map((item) => {
                        const permission = item.capability_id ? (capabilities[item.capability_id] || null) : (roles[item.role_id] || null);
                        item.description = permission.description || "";
                        item.name = permission.name || "";
                        return item;
                    })
                }, (sendPermissionsError, data) => {
                    // Check for save error
                    if (sendPermissionsError) {
                        reject(sendPermissionsError);
                    } else {
                        resolve(sendPermissionsError);
                    }
                });
            });
        }

        // Get array of authorisers
        const authorisers = uniq(
            Object.values(capabilities).concat(Object.values(roles))
                .map(item => item.authoriser)
                .filter((authoriser) => authoriser !== "null" && authoriser !== null)
        );

        // Send email to each authoriser?
        if (authorisers.length > 0) {
            await Promise.all(
                authorisers.reduce((promises, authoriser, i) => {
                    promises.push(
                        new Promise((resolve, reject) => {
                            // Declare params
                            const typeParams = {
                                id: permissionRequest.id,
                                email: authoriser,
                                roles: Object.values(roles).reduce((filtered, role) => {
                                    if (role.authoriser === authoriser) {
                                        filtered.push(role.id);
                                    }
                                    return filtered;
                                }, []),
                                capabilities: Object.values(capabilities).reduce((filtered, capability) => {
                                    if (capability.authoriser === authoriser) {
                                        filtered.push(capability.id);
                                    }
                                    return filtered;
                                }, []),
                                expiry: new Date(new Date().getTime() + 5184000000).toISOString()
                            };
                            typeParams.token = jwt.sign(
                                typeParams, credentials.secret, { expiresIn: 5184000 } // 5184000 = 60 days
                            );

                            // Send mail
                            EmailHelper.sendMail(
                                {
                                    to: authoriser,
                                    subject: "Nexus BI Platform Access",
                                    message: `
                        <p>${user.name} has requested further access to the Nexus BI Platform.</p>
                        <p>Click below to view the request details...</p>`,
                                    actions: [
                                        {
                                            class: "primary",
                                            text: "View Request",
                                            type: "permission_request_action",
                                            type_params: typeParams
                                        },
                                    ],
                                },
                                (errorSend) => {
                                    if (errorSend) {
                                        console.log(
                                            "Unable to send authorization request email to: " + formData.email +
                                            ". Reason: " + errorSend.toString()
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
            );

            // All emails sent successfully
            return { success: true, msg: "Request submitted successfully" };
        } else {
            return {
                success: true,
                msg: "The permissions have been added to your account",
                data: {
                    authorised: true
                }
            };
        }
    } catch (error) {
        console.log(error);
        return { success: false, status: 500, msg: error.toString() || "An error occurred submitting the request" };
    }
};
router.post("/permissions", MiddlewareHelper.validate(
    "body",
    { user_id: { type: "string", pattern: "[A-z. 0-9]{1,50}#[A-z. ]{1,50}" } },
    { pattern: "The user id should be in the format of 'username#organisation'" }
), (req, res, next) => {
    requestPermissionsRoute(req.body).then((result) => {
        res.status(result.status || 200).json(result);
    });
});

/**
 * @swagger
 * /requests/permissions/complete:
 *   post:
 *     description: Complete a request for further permissions
 *     tags:
 *      - Requests
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: token
 *        description: Token to authenticate authoriser
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
router.post("/permissions/complete", (req, res, next) => {
    // Get form data
    let formData = req.body;

    if (!formData.parent_id || !formData.action || !formData.date) {
        res.status(400).json({ success: false, msg: "Missing params" });
        return;
    }

    // Read jwt
    formData = Object.assign({}, formData, jwt.decode(formData.token));
    console.log(formData);

    // Get parent request
    formSubmissionsModel.getByKeys(
        {
            id: formData.parent_id,
        },
        (getRequestError, permissionRequests) => {
            // Return error
            if (getRequestError) {
                res.status(500).json({ success: false, msg: getRequestError });
                return;
            }

            // Return error if no items found
            if (permissionRequests.Items.length === 0) {
                res.status(404).json({ success: false, msg: "Request no longer exists" });
                return;
            }

            // Get request
            const permissionRequest = permissionRequests.Items[0];

            // Change approved status of each capability & role
            const setApprovalStatus = (type) => {
                const actionedPermissionIds = formData[type].map((item) => item.id);
                permissionRequest.data[type] = permissionRequest.data[type].map((item) => {
                    if (item.approved === null && actionedPermissionIds.includes(item.id)) {
                        item.approved = formData.action === "approve";
                    }
                    return item;
                });
            };
            setApprovalStatus("roles"); setApprovalStatus("capabilities");
            console.log(permissionRequest.data);

            // Set completion status
            if (permissionRequest.data["capabilities"].concat(permissionRequest.data["roles"]).filter(
                (item) => item.approved == null).length === 0
            ) {
                permissionRequest.data.completed = true;
            }

            // Store action request
            let formSubmission;
            if (formData.action === "approve") {
                formSubmission = {
                    id: uuid.v1(),
                    parent_id: formData.parent_id,
                    type: "PermissionRequestComplete",
                    data: {
                        action: formData.action,
                        officer: formData.officer,
                        officer_job: formData.officer_job,
                        authoriser: formData.email,
                        organisation: formData.organisation,
                    },
                    created_at: formData.date,
                };
            } else {
                formSubmission = {
                    id: uuid.v1(),
                    parent_id: formData.parent_id,
                    type: "PermissionRequestComplete",
                    data: {
                        action: formData.action,
                        reason: formData.reason,
                        authoriser: formData.email
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
                        data: permissionRequest.data,
                    },
                    (permissionRequestError, data) => {
                        if (permissionRequestError) {
                            console.log("Permission request error", permissionRequestError);
                            res.status(500).json({ success: false, msg: permissionRequestError });
                            return;
                        }

                        // Manage approval status
                        (async () => {
                            // Get actioned permissions
                            const getActionedPermissions = (type) => {
                                return permissionRequest.data[type].filter((item) =>
                                    formData[type].includes(item.id)
                                );
                            };

                            // Create email data
                            const email = {
                                user: permissionRequest.data.user,
                                permissions: [].concat(
                                    Object.values(await RequestsHelper.getRequestedCapabilities(
                                        getActionedPermissions("capabilities").map((item) => item.id)
                                    )),
                                    Object.values(await RequestsHelper.getRequestedRoles(
                                        getActionedPermissions("roles").map((item) => item.id)
                                    ))
                                ),
                            };

                            // Manage approval status
                            if (formData.action === "approve") {
                                // Link approved permissions
                                await RequestsHelper.linkRequestedCapbilities(
                                    permissionRequest.data.user,
                                    getActionedPermissions("capabilities")
                                );
                                await RequestsHelper.linkRequestedRoles(
                                    permissionRequest.data.user,
                                    getActionedPermissions("roles")
                                );
                            } else {
                                // Set denied status
                                email.status = {
                                    authorised: false,
                                    message: `<b>Reason:</b> ${formData.reason}`
                                };
                            }

                            // Send status email
                            await new Promise((resolve, reject) => {
                                RequestsHelper.emailPermissionsRequestStatus(
                                    email,
                                    (sendPermissionsError) => {
                                        // Check for save error
                                        if (sendPermissionsError) {
                                            reject(sendPermissionsError);
                                        } else {
                                            resolve(true);
                                        }
                                    }
                                );
                            });
                        })().then(() => {
                            res.json({ success: true, msg: "Your response has been recorded" });
                        }).catch((error) => {
                            res.status(500).json({ success: false, msg: error.toString() || "An error occurred submitting the request" });
                        });
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
