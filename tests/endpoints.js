module.exports.SecureEndpoints = [
    {
        url: "/access-logs",
        type: "JWT",
        method: "get",
    },
    // {
    //     url: `/{user}/access-logs`,
    //     type: "JWT",
    //     method: "get",
    // },
    {
        url: "/access-logs/statistics",
        type: "JWT",
        method: "get",
    },
    {
        url: "/access-logs/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/apps/",
        type: null,
        method: "get",
    },
    {
        url: "/apps/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/apps/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/apps/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/capabilities",
        type: null,
        method: "get",
    },
    {
        url: "/capabilities/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/capabilities/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/capabilities/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/capabilities/tags/getByTag",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/tags/getByTagsAnd",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/tags/getByTagsOr",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/links/sync",
        type: "JWT",
        method: "post",
    },
    {
        url: "/capabilities/links/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/capabilities/links/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/capabilities/roles/getByRoleName",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/teamids/getByTeamIds",
        type: "JWT",
        method: "get",
    },
    {
        url: `/capabilities/getAllCapabilitesWithTeamAndUsername`,
        type: "JWT",
        method: "post",
    },
    // {
    //     url: `/{type}/{id}/capabilities`,
    //     type: "JWT",
    //     method: "get",
    // },
    {
        url: "/cohorts/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/cohorts/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/cohorts/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/cohorts/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/confluence/content/search",
        type: null,
        method: "get",
    },
    // {
    //     url: `/confluence/content/{id}`,
    //     type: null,
    //     method: "get",
    // },
    {
        url: "/cvicohorts/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/cvicohorts/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/cvicohorts/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/cvicohorts/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/dashboards/",
        type: null,
        method: "get",
    },
    {
        url: "/dashboards/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/dashboards/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/dashboards/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/demographics/demographicsbynhsnumber",
        type: "JWT",
        method: "get",
    },
    {
        url: "/demographics/validateNHSNumber",
        type: "JWT",
        method: "post",
    },
    {
        url: "/demographics/findMyNHSNumber",
        type: "JWT",
        method: "post",
    },
    {
        url: "/docobo/acknowledgements/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/docobo/acknowledgements/report",
        type: "JWT",
        method: "post",
    },
    {
        url: "/docobooutbound/getpatientsbyorg",
        type: "JWT",
        method: "post",
    },
    {
        url: "/docobooutbound/getpatientdata",
        type: "JWT",
        method: "post",
    },
    {
        url: "/docobooutbound/processDocoboInfo",
        type: "JWT",
        method: "get",
    },
    {
        url: "/govuk/callback",
        type: null,
        method: "post",
    },
    {
        url: "/govuk/maincallback",
        type: null,
        method: "post",
    },
    {
        url: "/gpinpatients/authenticate",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/inpatientcounts",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/outpatientcounts",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/aecounts",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/ecscounts",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/epccounts",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/inpatientgpsummary",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gpinpatients/aegpsummary",
        type: "JWT",
        method: "post",
    },
    {
        url: "/gppractices/",
        type: null,
        method: "get",
    },
    {
        url: "/grandindex/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/isochrone/houses-within-isochrone",
        type: "JWT",
        method: "post",
    },
    {
        url: "/lpresviewer/generate-validation-key",
        type: "JWT",
        method: "post",
    },
    {
        url: "/mfa/register",
        type: "JWT",
        method: "get",
    },
    {
        url: "/mfa/checkmfa",
        type: "JWT",
        method: "get",
    },
    {
        url: "/mfa/verify",
        type: "JWT",
        method: "post",
    },
    {
        url: "/mfa/validate",
        type: "JWT",
        method: "post",
    },
    {
        url: "/mfa/unregister",
        type: "JWT",
        method: "get",
    },
    {
        url: "/otp/validate",
        type: "JWT",
        method: "post",
    },
    {
        url: "/mosaic/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/newsfeeds/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/newsfeeds/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/newsfeeds/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/newsfeeds/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/niceevidence/evidencesearch",
        type: "JWT",
        method: "post",
    },
    {
        url: "/opensource/getByPage",
        type: "JWT",
        method: "post",
    },
    {
        url: "/opensource/addView",
        type: null,
        method: "post",
    },
    {
        url: "/organisations/remove",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/organisations/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/organisations/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/organisations/",
        type: null,
        method: "get",
    },
    {
        url: "/orgboundaries/topo-json",
        type: "JWT",
        method: "get",
    },
    {
        url: "/outbreak/mapinfo",
        type: "JWT",
        method: "get",
    },
    {
        url: "/password/update",
        type: null,
        method: "put",
    },
    {
        url: "/patienthistory/patienthistorybynhsnumber",
        type: "JWT",
        method: "get",
    },
    {
        url: "/patienthistory/districthistorybynhsnumber",
        type: "JWT",
        method: "get",
    },
    {
        url: "/patientlists/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/patientlists/patientdetailsbynhsnumber",
        type: "JWT",
        method: "get",
    },
    {
        url: "/patientlists/getPatientsByCohort",
        type: "JWT",
        method: "get",
    },
    {
        url: "/pcninformation/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/pcninformation/hexgeo-json",
        type: "JWT",
        method: "get",
    },
    {
        url: "/pcninformation/topo-json",
        type: "JWT",
        method: "get",
    },
    {
        url: "/pointsofinterest/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/postcodes/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/postcodes/postcode-lookup",
        type: "JWT",
        method: "get",
    },
    {
        url: "/real_time_surveillance/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/real_time_surveillance/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/real_time_surveillance/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/real_time_surveillance/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/requests",
        type: "JWT",
        method: "get",
    },
    {
        url: "/requests/account",
        type: null,
        method: "post",
    },
    // {
    //     url: `/requests/account/{id}`,
    //     type: null,
    //     method: "post",
    // },
    {
        url: "/requests/account/complete",
        type: null,
        method: "post",
    },
    {
        url: "/requests/help",
        type: null,
        method: "post",
    },
    // {
    //     url: `/{type}/{id}/roles`,
    //     type: "JWT",
    //     method: "get",
    // },
    {
        url: "/roles",
        type: null,
        method: "get",
    },
    {
        url: "/roles/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/roles/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/roles/links/sync",
        type: "JWT",
        method: "post",
    },
    {
        url: "/roles/links/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/roles/links/delete",
        type: "JWT",
        method: "delete",
    },
    // {
    //     url: `/roles/{id}`,
    //     type: "JWT",
    //     method: "get",
    // },
    // {
    //     url: `/roles/{id}/delete`,
    //     type: "JWT",
    //     method: "delete",
    // },
    {
        url: "/searchs/teams",
        type: "JWT",
        method: "get",
    },
    {
        url: "/searchusers/profiles",
        type: "JWT",
        method: "get",
    },
    {
        url: "/searchusers/org-profiles",
        type: "JWT",
        method: "get",
    },
    {
        url: "/serviceaccounts/check",
        type: null,
        method: "post",
    },
    {
        url: "/shielding/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/spi_incidentmethods/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/spi_incidentmethods/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/spi_incidentmethods/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/spi_incidentmethods/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/systemalerts/",
        type: null,
        method: "get",
    },
    {
        url: "/systemalerts/getActive",
        type: "JWT",
        method: "get",
    },
    {
        url: "/systemalerts/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/systemalerts/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/systemalerts/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/teammembers/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/teammembers/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teammembers/getTeamMembersByCode",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teammembers/getTeamMembershipsByUsername",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teammembers/getTeamMembershipsByUsername",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teammembers/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/teamrequests/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/teamrequests/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/teamrequests/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/teamrequests/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teamrequests/getRequestsByUsername",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teamrequests/getRequestsByTeamCode",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teams",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teams/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/teams/update",
        type: "JWT",
        method: "put",
    },
    {
        url: `/teams/delete`,
        type: "JWT",
        method: "delete",
    },
    {
        url: "/teams/getTeamByCode",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teams/getTeamsByOrgCode",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teams/getTeamsByPartialTeamName",
        type: "JWT",
        method: "get",
    },
    {
        url: "/teams/getTeamsByPartialTeamNameAndOrgCode",
        type: "JWT",
        method: "get",
    },
    {
        url: "/trials/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/trials/search-top-100",
        type: "JWT",
        method: "post",
    },
    {
        url: "/userprofiles/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/userprofiles/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/userprofiles/getUserProfileByUsername",
        type: "JWT",
        method: "get",
    },
    {
        url: "/userprofiles/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/userprofiles/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/users/register",
        type: "JWT",
        method: "post",
    },
    {
        url: "/users/profile",
        type: "JWT",
        method: "get",
    },
    {
        url: "/users/authenticate",
        type: null,
        method: "post",
    },
    {
        url: "/users/authentication-refresh",
        type: "JWT",
        method: "post",
    },
    {
        url: "/users/validate",
        type: "JWT",
        method: "get",
    },
    {
        url: "/users/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/users/send-code",
        type: null,
        method: "post",
    },
    {
        url: "/users/verify-code",
        type: null,
        method: "post",
    },
    {
        url: "/virtualward_decision/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/virtualward_decision/getAllByStatus",
        type: "JWT",
        method: "post",
    },
    {
        url: "/virtualward_decision/status/update",
        type: "JWT",
        method: "post",
    },
    {
        url: "/virtualward_decision/getAllActioned",
        type: "JWT",
        method: "get",
    },
    {
        url: "/virtualward_decision/contact/update",
        type: "JWT",
        method: "post",
    },
    {
        url: "/virtualward_decision/contact/clear",
        type: "JWT",
        method: "post",
    },
    {
        url: "/virtualward_decision/notes/update",
        type: "JWT",
        method: "post",
    },
    {
        url: "/virtualward_decision/notes/clear",
        type: "JWT",
        method: "post",
    },
    {
        url: "/virtualward/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/virtualward/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/warddetails/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/wards/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/atomic/payloads/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/atomic/payloads/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/atomic/payloads/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/atomic/payloads/delete",
        type: "JWT",
        method: "delete",
    },
    // {
    //     url: "/atomic/payloads/{id}",
    //     type: "JWT",
    //     method: "get",
    // },
    {
        url: "/atomic/formdata/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/atomic/formdata/create",
        type: "JWT",
        method: "post",
    },
    {
        url: "/atomic/formdata/update",
        type: "JWT",
        method: "put",
    },
    {
        url: "/atomic/formdata/delete",
        type: "JWT",
        method: "delete",
    },
    // {
    //     url: "/atomic/formdata/{id}",
    //     type: "JWT",
    //     method: "get",
    // },
];
