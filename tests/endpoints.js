module.exports.SecureEndpoints = [
  {
    url: `/access-logs`,
    type: "JWT",
    method: "get",
  },
  // {
  //     url: `/{user}/access-logs`,
  //     type: "JWT",
  //     method: "get",
  // },
  {
    url: `/access-logs/statistics`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/access-logs/create`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/capabilities`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/capabilities/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/capabilities/update`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/capabilities/removeById`,
    type: "JWT",
    method: "delete",
  },
  {
    url: `/capabilities/getById`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/capabilities/getByTag`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/capabilities/getByTagsAnd`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/capabilities/getByTagsOr`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/capabilities/links/sync`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/capabilities/links/create`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/capabilities/links/delete`,
    type: "JWT",
    method: "delete",
  },
  {
    url: `/capabilities/getByRoleName`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/capabilities/getByTeamIds`,
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
    url: `/confluence/content/search`,
    type: null,
    method: "get",
  },
  // {
  //     url: `/confluence/content/{id}`,
  //     type: null,
  //     method: "get",
  // },
  {
    url: `/demographics/demographicsbynhsnumber`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/demographics/validateNHSNumber`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/demographics/findMyNHSNumber`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/docobo/acknowledgements/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/docobo/acknowledgements/report`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/docobooutbound/getpatientsbyorg`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/docobooutbound/getpatientdata`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/docobooutbound/processDocoboInfo`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/gpinpatients/authenticate`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/inpatientcounts`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/outpatientcounts`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/aecounts`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/ecscounts`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/epccounts`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/inpatientgpsummary`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/gpinpatients/aegpsummary`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/lpresviewer/getValidationKey`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/mfa/register`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/mfa/checkmfa`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/mfa/verify`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/mfa/validate`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/mfa/unregister`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/otp/validate`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/niceevidence/evidencesearch`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/opensource/getByPage`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/opensource/addView`,
    type: null,
    method: "post",
  },
  {
    url: `/password/update`,
    type: null,
    method: "post",
  },
  {
    url: `/patientlists/getPatients`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/patientlists/patientdetailsbynhsnumber`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/patientlists/getPatientsByCohort`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/pcninformation/getData`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/postcodes/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/requests`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/requests/account`,
    type: null,
    method: "post",
  },
  // {
  //     url: `/requests/account/{id}`,
  //     type: null,
  //     method: "post",
  // },
  {
    url: `/requests/account/complete`,
    type: null,
    method: "post",
  },
  {
    url: `/teamrequests/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/teamrequests/archive`,
    type: "JWT",
    method: "put",
  },
  {
    url: `/teamrequests/update`,
    type: "JWT",
    method: "put",
  },
  {
    url: `/teamrequests/getByID`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamrequests/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamrequests/getRequestsByUsername`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamrequests/getRequestsByTeamCode`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamrequests/getOutstandingRequests`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamrequests/getOutstandingRequests`,
    type: "JWT",
    method: "get",
  },
  // {
  //     url: `/{type}/{id}/roles`,
  //     type: "JWT",
  //     method: "get",
  // },
  {
    url: `/roles`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/roles/create`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/roles/update`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/roles/links/sync`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/roles/links/create`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/roles/links/delete`,
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
    url: `/searchs/searchTeams`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/searchusers/searchUserProfiles`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/searchusers/searchOrgUserProfiles`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/serviceaccounts/check`,
    type: null,
    method: "post",
  },
  {
    url: `/shielding/getCitizens`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teammembers/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/teammembers/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teammembers/getTeamMembersByCode`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teammembers/getTeamMembershipsByUsername`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teammembers/getTeamMembershipsByUsername`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teammembers/archive`,
    type: "JWT",
    method: "put",
  },
  // {
  //   url: `/teamprofiles/register`,
  //   type: "JWT",
  //   method: "post",
  // },
  // {
  //   url: `/teamprofiles/getAll`,
  //   type: "JWT",
  //   method: "get",
  // },
  {
    url: `/teamprofiles/getTeamByCode`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamprofiles/getTeamsByOrgCode`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamprofiles/getTeamsByPartialTeamName`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamprofiles/getTeamsByPartialTeamNameAndOrgCode`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamprofiles/archive`,
    type: "JWT",
    method: "put",
  },
  // {
  //   url: `/teamprofiles/update`,
  //   type: "JWT",
  //   method: "put",
  // },
  {
    url: `/teams`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teams/create`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/teams/update`,
    type: "JWT",
    method: "post",
  },
  // {
  //     url: `/teams/{id}/delete`,
  //     type: "JWT",
  //     method: "delete",
  // },
  {
    url: `/trials/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/trials/getSearchTop1000`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/userprofiles/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/userprofiles/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/userprofiles/getUserProfileByUsername`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/userprofiles/archive`,
    type: "JWT",
    method: "put",
  },
  {
    url: `/userprofiles/update`,
    type: "JWT",
    method: "put",
  },
  {
    url: `/users/register`,
    type: null,
    method: "post",
  },
  {
    url: `/users/profile`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/users/authenticate`,
    type: null,
    method: "post",
  },
  {
    url: `/users/validate`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/users/delete`,
    type: "JWT",
    method: "delete",
  },
  {
    url: `/virtualward/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/virtualward/update`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/users/send-code`,
    type: null,
    method: "post",
  },
  {
    url: `/users/verify-code`,
    type: null,
    method: "post",
  },
  {
    url: "/grandindex/getAll",
    type: "JWT",
    method: "get",
  },
  {
    url: "/gppractices/getAll",
    type: null,
    method: "get",
  },
  {
    url: "/wards/getAll",
    type: "JWT",
    method: "get",
  },
  {
    url: "/pcninformation/getHexGeojson",
    type: "JWT",
    method: "get",
  },
  {
    url: "/pcninformation/getTopoJSON",
    type: "JWT",
    method: "get",
  },
  {
    url: "/orgboundaries/getTopoJSON",
    type: "JWT",
    method: "get",
  },
  {
    url: "/isochrone/getHousesWithinIsochrone",
    type: "JWT",
    method: "post",
  },
  {
    url: "/outbreak/mapinfo",
    type: "JWT",
    method: "get",
  },
];
