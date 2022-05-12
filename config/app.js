const DIULibrary = require("diu-data-functions").Methods.DynamoDBData;
const AWS = require("../config/database").AWS;
let loadedConfiguration = null;

const getConfigurationFromDatabase = async (callback) => {
    DIULibrary.getItemByKey(AWS, "atomic_payload", "id", "apisettings", (err, results) => {
        if (err) {
            callback(err);
        } else {
            if (results.Items.length > 0) {
                loadedConfiguration = results.Items[0].config;
                callback(null, loadedConfiguration);
            } else {
                callback(null, null);
            }
        }
    });
};

module.exports = {
    loadedConfiguration,
    getConfigurationFromDatabase,
    configureApis: async () => {
        // To-do: Check for local .env file first
        const AWSHelper = require("diu-data-functions").Helpers.Aws;

        await getConfigurationFromDatabase((err, configuration) => {
            if (err) {
                console.log("ERROR: " + JSON.stringify(err));
                throw err;
            } else {
                configuration.configuration.forEach(async (api) => {
                    try {
                        const credentials = JSON.parse(await AWSHelper.getSecrets(api.secretName));
                        api.secrets.forEach((secret) => {
                            const key = Object.keys(secret)[0];
                            process.env[key] = credentials[secret[key]];
                        });
                        console.log("Loaded configuration for: " + api.configName);
                    } catch (e) {
                        console.error("Could not configure " + api.configName + " settings");
                    }
                });
            }
        });

        return "Configured Application";
    },
};
