// ---- Declare main config ----
module.exports = {};

// ---- Add settings for each org  ----
const baseOrgSettings = {
    attributes: {
        user: [
            "manager", "distinguishedName", "userPrincipalName",
            "sAMAccountName", "mail", "lockoutTime", "whenCreated",
            "pwdLastSet", "userAccountControl", "employeeID",
            "sn", "givenName", "initials", "cn", "displayName",
            "comment", "description", "linemanager", "objectSid"
        ],
        group: ["distinguishedName", "objectCategory", "cn", "description"],
    },
    entryParser(entry, raw, callback) {
        if (raw.hasOwnProperty("objectGUID")) {
            entry.objectGUID = raw.objectGUID;
        }
        if (raw.hasOwnProperty("objectSid")) {
            entry.objectSid = raw.objectSid;
        }
        callback(entry);
    }
}
module.exports.org_settings = {
    lcsu: Object.assign({
        url: "ldap://10.212.120.150",
        baseDN: "dc=xlcsu,dc=nhs,dc=uk",
        bindDN: process.env.AD_CREDENTIALS.lcsuauth,
        bindCredentials: process.env.AD_CREDENTIALS.lcsupass
    }, baseOrgSettings),
    xmlcsu: Object.assign({
        url: "ldap://10.212.120.50",
        baseDN: "dc=xmlcsu,dc=nhs,dc=uk",
        bindDN: process.env.AD_CREDENTIALS.xmlcsuauth,
        bindCredentials: process.env.AD_CREDENTIALS.xmlcsupass
    }, baseOrgSettings),
    xfyldecoast: Object.assign({
        url: "ldap://10.164.32.24:389",
        baseDN: "ou=ADUsers,dc=xfyldecoast,dc=nhs,dc=uk",
        bindDN: process.env.AD_CREDENTIALS.ldapauth,
        bindCredentials: process.env.AD_CREDENTIALS.ldappass
    }, baseOrgSettings),
    uhmbt: Object.assign({
        url: "ldap://10.164.32.24:3268",
        baseDN: "dc=nhs,dc=uk",
        bindDN: process.env.AD_CREDENTIALS.ldapauth,
        bindCredentials: process.env.AD_CREDENTIALS.ldappass
    }, baseOrgSettings),
    nwas: Object.assign({
        url: "ldap://10.238.1.132:3268",
        baseDN: "dc=nhs,dc=uk",
        bindDN: process.env.AD_CREDENTIALS.nwasldapauth,
        bindCredentials: process.env.AD_CREDENTIALS.nwasldappass
    }, baseOrgSettings)
}