const ADClient = require("activedirectory");

class ActiveDirectory {
    getInstance(authmethod, callback) {
        // Get the configuration
        let configuration = require("../config/app").loadedConfiguration;
        if (!configuration) {
            // No settings in database
            configuration = { activedirectories: [] };
        }
        const activedirectories = configuration.activedirectories;

        const selectedOrganisation = activedirectories.find((organisation) => {
            return organisation.authmethod === authmethod;
        });
        if (!selectedOrganisation) {
            callback(new Error("No active directory configuration found for: " + authmethod));
        } else {
            const data = {
                authentication: authmethod,
                url: selectedOrganisation.url,
                baseDN: selectedOrganisation.baseDN,
                bindDN: process.env[selectedOrganisation.bindDN],
                bindCredentials: process.env[selectedOrganisation.bindCredentials],
            };

            callback(
                null,
                new ADClient(
                    Object.assign(
                        {
                            attributes: {
                                user: [
                                    "manager",
                                    "distinguishedName",
                                    "userPrincipalName",
                                    "sAMAccountName",
                                    "mail",
                                    "lockoutTime",
                                    "whenCreated",
                                    "pwdLastSet",
                                    "userAccountControl",
                                    "employeeID",
                                    "sn",
                                    "givenName",
                                    "initials",
                                    "cn",
                                    "displayName",
                                    "comment",
                                    "description",
                                    "linemanager",
                                    "objectSid",
                                ],
                                group: ["distinguishedName", "objectCategory", "cn", "description"],
                            },
                            entryParser(entry, raw, innerCallback) {
                                // eslint-disable-next-line no-prototype-builtins
                                if (raw.hasOwnProperty("objectGUID")) {
                                    entry.objectGUID = raw.objectGUID;
                                }
                                // eslint-disable-next-line no-prototype-builtins
                                if (raw.hasOwnProperty("objectSid")) {
                                    entry.objectSid = raw.objectSid;
                                }
                                innerCallback(entry);
                            },
                        },
                        data
                    )
                )
            );
        }
    }
}

module.exports = ActiveDirectory;
