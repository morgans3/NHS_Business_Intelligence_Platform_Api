// @ts-check

// Self invocation to allow for top-level async
module.exports = (async () => {
  require("dotenv").config();
  const AWSHelper = require("diu-data-functions").Helpers.Aws;
  try {
    // Email Integration Settings
    const emailCredentials = JSON.parse(await AWSHelper.getSecrets("email"));
    process.env.EMAIL_HOST = emailCredentials.host;
    process.env.EMAIL_PASSWORD = emailCredentials.password;
    process.env.EMAIL_USERNAME = emailCredentials.username;

    // DOCOBO Integration Settings
    const docoboCredentials = JSON.parse(await AWSHelper.getSecrets("docobo"));
    process.env.DOCOBO_SERVER = docoboCredentials.server;
    process.env.DOCOBO_INBOUNDKEY = docoboCredentials.inboundkey;
    process.env.DOCOBO_OUTBOUNDKEY = docoboCredentials.outboundkey;

    // TODO: change configuration of Active Directory based on scalable format
    // Active Directory Integration Settings
    const adCredentials = JSON.parse(await AWSHelper.getSecrets("adcredentials"));
    process.env.AD_CREDENTIALS_LCSUAUTH = adCredentials.lcsuauth;
    process.env.AD_CREDENTIALS_LCSUPASS = adCredentials.lcsupass;
    process.env.AD_CREDENTIALS_XMLCSUAUTH = adCredentials.xmlcsuauth;
    process.env.AD_CREDENTIALS_XMLCSUPASS = adCredentials.xmlcsupass;
    process.env.AD_CREDENTIALS_LDAPAUTH = adCredentials.ldapauth;
    process.env.AD_CREDENTIALS_LDAPPASS = adCredentials.ldappass;
    process.env.AD_CREDENTIALS_NWASLDAPAUTH = adCredentials.nwasldapauth;
    process.env.AD_CREDENTIALS_NWASLDAPPASS = adCredentials.nwasldappass;

    // NICE Integration Settings
    process.env.NICEAPI_KEY = JSON.parse(await AWSHelper.getSecrets("nice_api")).key;

    // Confluence Integration Settings
    process.env.CONFLUENCE_KEY = JSON.parse(await AWSHelper.getSecrets("confluence_key")).apikey;

    // BTH Integration Settings
    process.env.BTHAUTHKEY = JSON.parse(await AWSHelper.getSecrets("bth_authkey")).key;
  } catch (error) {
    console.error(error);
  }

  return "Configured Application";
})();
