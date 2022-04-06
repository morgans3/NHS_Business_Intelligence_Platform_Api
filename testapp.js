// @ts-check

// Self invocation to allow for top-level async
module.exports = (async () => {
  if (process.env.DEV && (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === null)) {
    require("dotenv").config();
    const AWSHelper = require("diu-data-functions").Helpers.Aws;
    try {
      const postgresCredentials = JSON.parse(await AWSHelper.getSecrets("postgres"));
      const jwtCredentials = JSON.parse(await AWSHelper.getSecrets("jwt"));
      const awsCredentials = JSON.parse(await AWSHelper.getSecrets("awsdev"));
      const adcredentials = JSON.parse(await AWSHelper.getSecrets("adcredentials"));
      process.env.POSTGRES_UN = postgresCredentials.username;
      process.env.POSTGRES_PW = postgresCredentials.password;
      process.env.JWT_SECRET = jwtCredentials.secret;
      process.env.JWT_SECRETKEY = jwtCredentials.secretkey;
      process.env.AWS_SECRETID = awsCredentials.secretid;
      process.env.AWS_SECRETKEY = awsCredentials.secretkey;
      process.env.AD_CREDENTIALS = adcredentials;
    } catch (error) {
      console.error(error);
    }
  }
  process.env.TZ = "Europe/London";
  return require("./app");
})();
