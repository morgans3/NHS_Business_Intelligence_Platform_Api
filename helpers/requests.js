const DIULibrary = require("diu-data-functions");
const CapabilityLinkModel = new DIULibrary.Models.CapabilityLinkModel();
class RequestsHelper {
    static linkRequestedCapbilities(user, capabilities) {
        // Create array of links
        const userCapabilityLinks = [];
        capabilities.forEach((parentCapability) => {
            // Add main link
            userCapabilityLinks.push({
                capability_id: parentCapability.id,
                link_id: `${user.username}#${user.organisation}`,
                link_type: "user",
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
                            link_id: `${user.username}#${user.organisation}`,
                            link_type: "user",
                            approved_by: parentCapability.approved_by,
                            valuejson: childCapability.valuejson
                        });
                    } else {
                        childCapability.valuejson.forEach((valuejson) => {
                            userCapabilityLinks.push({
                                capability_id: childCapability.id,
                                link_id: `${user.username}#${user.organisation}`,
                                link_type: "user",
                                approved_by: parentCapability.approved_by,
                                valuejson
                            });
                        });
                    }
                });
            }
        });

        // Persist links
        return Promise.all(userCapabilityLinks
            .reduce((promises, capabilityLink, i) => {
                promises.push(new Promise((resolve, reject) => {
                    CapabilityLinkModel.create(capabilityLink, (err, link) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(link);
                        }
                    });
                }));
                return promises;
            }, [])
        );
    }
}

module.exports = RequestsHelper;
