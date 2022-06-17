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
        url: "/capabilities",
        type: "JWT",
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
        method: "post",
    },
    {
        url: "/capabilities/delete",
        type: "JWT",
        method: "delete",
    },
    {
        url: "/capabilities/getByTag",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/getByTagsAnd",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/getByTagsOr",
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
        url: "/capabilities/getByRoleName",
        type: "JWT",
        method: "get",
    },
    {
        url: "/capabilities/getByTeamIds",
        type: "JWT",
        method: "get",
    },
    // {
    //   url: `/capabilities/getAllCapabilitiesWithTeamAndUsername`,
    //   type: "JWT",
    //   method: "post",
    // },
    // {
    //     url: `/{type}/{id}/capabilities`,
    //     type: "JWT",
    //     method: "get",
    // },
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
        url: "/password/update",
        type: null,
        method: "post",
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
        url: "/postcodes/",
        type: "JWT",
        method: "get",
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
    // {
    //     url: `/{type}/{id}/roles`,
    //     type: "JWT",
    //     method: "get",
    // },
    {
        url: "/roles",
        type: "JWT",
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
        method: "post",
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
        method: "post",
    },
    // {
    //     url: `/teams/{id}/delete`,
    //     type: "JWT",
    //     method: "delete",
    // },
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
        type: null,
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
        url: "/virtualward/",
        type: "JWT",
        method: "get",
        queryString: "?limit={limit}",
    },
    {
        url: "/virtualward/update",
        type: "JWT",
        method: "post",
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
        url: "/grandindex/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/gppractices/",
        type: null,
        method: "get",
    },
    {
        url: "/wards/",
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
        url: "/orgboundaries/topo-json",
        type: "JWT",
        method: "get",
    },
    {
        url: "/isochrone/houses-within-isochrone",
        type: "JWT",
        method: "post",
    },
    {
        url: "/outbreak/mapinfo",
        type: "JWT",
        method: "get",
    },
    // {
    //   url: "/payloads/{id}",
    //   type: "JWT",
    //   method: "get",
    // },
    {
        url: "/warddetails/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/mosaic/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/mosaic/",
        type: "JWT",
        method: "get",
    },
    {
        url: "/pointsofinterest/",
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
        method: "post",
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
        method: "post",
    },
    {
        url: "/organisations/",
        type: null,
        method: "get",
    },
    {
        url: "/newsfeeds/remove",
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
        method: "post",
    },
    {
        url: "/newsfeeds/",
        type: "JWT",
        method: "get",
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
];
