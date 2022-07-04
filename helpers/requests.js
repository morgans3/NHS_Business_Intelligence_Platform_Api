const DIULibrary = require("diu-data-functions");
const EmailHelper = DIULibrary.Helpers.Email;
const RoleModel = new DIULibrary.Models.RoleModel();
const CapabilityModel = new DIULibrary.Models.CapabilityModel();
const RoleLinkModel = new DIULibrary.Models.RoleLinkModel();
const CapabilityLinkModel = new DIULibrary.Models.CapabilityLinkModel();
const { keyBy } = require("lodash");

class RequestsHelper {
    static emailPermissionsRequestStatus({
        user,
        type,
        permissions,
        status = {
            authorised: true,
            message: null
        }
    }, callback) {
        // Generate html message
        let message = `<p>The ${type} permissions you requested below have been `;
        message += status.authorised === true ? "authorised" : "denied";
        message += " for your account...</p><ul>";
        permissions.forEach((permission) => {
            message += `<li><b>${permission.name}</b><br>${permission.description}</li>`;
        });
        message += "</ul>";
        if (status.message) { message += `<p>${status.message}</p>`; }

        // Send email
        EmailHelper.sendMail(
            {
                to: user.email,
                subject: "BI Platform Access",
                message,
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
                    console.log("Unable to send notification to: " + user.email + ". Reason: " + error.toString());
                    callback(error, null);
                } else {
                    callback(null, "Email sent successfully");
                }
            }
        );
    }

    static getRequestedCapabilities(capabilities) {
        return new Promise((resolve, reject) => {
            CapabilityModel.query(
                {
                    text: "SELECT * FROM capabilities WHERE id = ANY($1)",
                    values: [capabilities],
                },
                (capabilityQueryError, data) => {
                    // Check for error
                    if (capabilityQueryError) { reject(capabilityQueryError); };

                    // Hydrate capabilties
                    resolve(keyBy(data, (capability) => capability.id));
                }
            );
        });
    }

    static getRequestedRoles(roles) {
        return new Promise((resolve, reject) => {
            RoleModel.query(
                {
                    text: "SELECT * FROM roles WHERE id = ANY($1)",
                    values: [roles],
                },
                (roleQueryError, data) => {
                    // Check for error
                    if (roleQueryError) { reject(roleQueryError); };

                    // Hydrate roles
                    resolve(keyBy(data, (role) => role.id));
                }
            );
        });
    }

    static linkRequestedRoles(link = { id: "", type: "" }, roles) {
        // Persist links
        if (roles.length > 0) {
            return Promise.all(roles
                .reduce((promises, role, i) => {
                    promises.push(new Promise((resolve, reject) => {
                        RoleLinkModel.create({
                            role_id: role.id,
                            link_id: link.id,
                            link_type: link.type,
                            approved_by: role.approved_by,
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data[0] || data);
                            }
                        });
                    }));
                    return promises;
                }, [])
            );
        } else {
            return new Promise((resolve) => { resolve([]); });
        }
    }

    static linkRequestedCapbilities(link = { id: "", type: "" }, capabilities) {
        // Create array of links
        const userCapabilityLinks = [];
        capabilities.forEach((parentCapability) => {
            // Add main link
            userCapabilityLinks.push({
                capability_id: parentCapability.id,
                link_id: link.id,
                link_type: link.type,
                approved_by: parentCapability.approved_by,
                valuejson: parentCapability.valuejson
            });

            // Check for children
            if (parentCapability?.meta?.children) {
                parentCapability.meta.children.forEach((childCapability) => {
                    // Check if valuejson is array?
                    if (!(childCapability.valuejson instanceof Array)) {
                        userCapabilityLinks.push({
                            capability_id: childCapability.id,
                            link_id: link.id,
                            link_type: link.type,
                            approved_by: parentCapability.approved_by,
                            valuejson: childCapability.valuejson
                        });
                    } else {
                        childCapability.valuejson.forEach((valuejson) => {
                            userCapabilityLinks.push({
                                capability_id: childCapability.id,
                                link_id: link.id,
                                link_type: link.type,
                                approved_by: parentCapability.approved_by,
                                valuejson
                            });
                        });
                    }
                });
            }
        });

        // Persist links
        if (userCapabilityLinks.length > 0) {
            return Promise.all(userCapabilityLinks
                .reduce((promises, capabilityLink, i) => {
                    promises.push(new Promise((resolve, reject) => {
                        CapabilityLinkModel.create(capabilityLink, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data[0] || data);
                            }
                        });
                    }));
                    return promises;
                }, [])
            );
        } else {
            return new Promise((resolve) => { resolve([]); });
        }
    }
}

module.exports = RequestsHelper;
