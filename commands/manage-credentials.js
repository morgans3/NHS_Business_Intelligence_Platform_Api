(async () => {
    try {
        // Configure app secrets
        const AWSHelper = require("diu-data-functions").Helpers.Aws;
        const AwsCredentials = JSON.parse(await AWSHelper.getSecrets("awsdev"));
        process.env.AWS_SECRETID = AwsCredentials.secretid;
        process.env.AWS_SECRETKEY = AwsCredentials.secretkey;
        const jwtCredentials = JSON.parse(await AWSHelper.getSecrets("jwt"));
        process.env.JWT_SECRET = jwtCredentials.secret;
        process.env.JWT_SECRETKEY = jwtCredentials.secretkey;
    } catch (error) {
        console.error(error);
    }
})().then(() => {
    // Create realine interface
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Import model
    const DIULibrary = require("diu-data-functions");
    const CredentialsModel = new DIULibrary.Models.CredentialModel();

    // Ask for type
    rl.question("Do you want to read (r) or create (c) credentials?", (command) => {
        if (command === "r") {
            rl.question("Enter the credential type: ", (type) => {
                rl.question("Enter the credential name: ", (name) => {
                    CredentialsModel.getByKeys({ type, name }, (getError, result) => {
                        console.log(result.Items);
                        process.exit();
                    });
                });
            });
        } else {
            rl.question("Enter the credential type: ", (type) => {
                rl.question("Enter the credential name: ", (name) => {
                    rl.question("Enter the credential data: ", (data) => {
                        // Parse JSON
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            console.log("Data must be valid JSON");
                            process.exit();
                        }

                        // Persis
                        CredentialsModel.create(
                            {
                                type,
                                name,
                                data,
                            },
                            (err, result) => {
                                if (err) {
                                    console.log(err);
                                }
                                console.log("Credential created!");
                                process.exit();
                            }
                        );
                    });
                });
            });
        }
    });
});
