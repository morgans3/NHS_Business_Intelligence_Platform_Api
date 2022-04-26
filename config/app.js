module.exports = {
    configureApis: async () => {
        //To-do: Check for local .env file first
        const AWSHelper = require("diu-data-functions").Helpers.Aws;
        
        try {
            // Email Integration Settings
            const emailCredentials = JSON.parse(await AWSHelper.getSecrets("email"));
            process.env.EMAIL_HOST = emailCredentials.host;
            process.env.EMAIL_PASSWORD = emailCredentials.password;
            process.env.EMAIL_USERNAME = emailCredentials.username;
        } catch(e) { console.error('Could not configure email settings'); }

        try {
            // DOCOBO Integration Settings
            const docoboCredentials = JSON.parse(await AWSHelper.getSecrets("docobo"));
            process.env.DOCOBO_SERVER = docoboCredentials.server;
            process.env.DOCOBO_INBOUNDKEY = docoboCredentials.inboundkey;
            process.env.DOCOBO_OUTBOUNDKEY = docoboCredentials.outboundkey;
        } catch(e) { console.error('Could not configure docobo settings'); }

        try {
            // NICE Integration Settings
            process.env.NICEAPI_KEY = JSON.parse(await AWSHelper.getSecrets("nice_api")).key;
        } catch(e) { console.error('Could not configure nice api credentials'); }

        try {
            // Confluence Integration Settings
            process.env.CONFLUENCE_KEY = JSON.parse(await AWSHelper.getSecrets("confluence_key")).apikey;
        } catch(e) { console.error('Could not configure confluence api settings'); }

        try {
            // BTH Integration Settings
            process.env.BTHAUTHKEY = JSON.parse(await AWSHelper.getSecrets("bth_authkey")).key;
        } catch(e) { console.error('Could not configure bth key settings'); }

        return "Configured Application";
    }
}