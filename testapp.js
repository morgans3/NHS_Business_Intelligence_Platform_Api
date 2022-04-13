// @ts-check

// Self invocation to allow for top-level async
module.exports = (async () => {
  if (process.env.DEV && (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === null)) {
    require("dotenv").config();
    const AWSHelper = require("diu-data-functions").Helpers.Aws;
    try {
      const postgresCredentials = JSON.parse(await AWSHelper.getSecrets("postgres"));
      process.env.POSTGRES_UN = postgresCredentials.username;
      process.env.POSTGRES_PW = postgresCredentials.password;

      const jwtCredentials = JSON.parse(await AWSHelper.getSecrets("jwt"));
      process.env.JWT_SECRET = jwtCredentials.secret;
      process.env.JWT_SECRETKEY = jwtCredentials.secretkey;

      const awsCredentials = JSON.parse(await AWSHelper.getSecrets("awsdev"));
      process.env.AWS_SECRETID = awsCredentials.secretid;
      process.env.AWS_SECRETKEY = awsCredentials.secretkey;

      const emailCredentials = JSON.parse(await AWSHelper.getSecrets("email"));
      process.env.EMAIL_HOST = emailCredentials.host;
      process.env.EMAIL_PASSWORD = emailCredentials.password;
      process.env.EMAIL_USERNAME = emailCredentials.username;

      const docoboCredentials = JSON.parse(await AWSHelper.getSecrets("docobo"));
      process.env.DOCOBO_SERVER = docoboCredentials.server;
      process.env.DOCOBO_INBOUNDKEY = docoboCredentials.inboundkey;
      process.env.DOCOBO_OUTBOUNDKEY = docoboCredentials.outboundkey;

      const adCredentials = JSON.parse(await AWSHelper.getSecrets("adcredentials"));
      process.env.AD_CREDENTIALS_LCSUAUTH = adCredentials.lcsuauth;
      process.env.AD_CREDENTIALS_LCSUPASS = adCredentials.lcsupass;
      process.env.AD_CREDENTIALS_XMLCSUAUTH = adCredentials.xmlcsuauth;
      process.env.AD_CREDENTIALS_XMLCSUPASS = adCredentials.xmlcsupass;
      process.env.AD_CREDENTIALS_LDAPAUTH = adCredentials.ldapauth;
      process.env.AD_CREDENTIALS_LDAPPASS = adCredentials.ldappass;
      process.env.AD_CREDENTIALS_NWASLDAPAUTH = adCredentials.nwasldapauth;
      process.env.AD_CREDENTIALS_NWASLDAPPASS = adCredentials.nwasldappass;

      process.env.NICEAPI_KEY = JSON.parse(await AWSHelper.getSecrets("nice_api")).key;
      process.env.CONFLUENCE_KEY = JSON.parse(await AWSHelper.getSecrets("confluence_key")).apikey;
    } catch (error) {
      console.error(error);
    }
  }
  process.env.TZ = "Europe/London";
  return require("./app");
})();
