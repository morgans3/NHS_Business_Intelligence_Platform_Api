module.exports.SecureEndpoints = [
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
    url: `/serviceaccounts/check`,
    type: null,
    method: "post",
  },
  {
    url: `/teamroles/getItemsByTeamcode`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/teamroles/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/teamroles/remove`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/teamroles/getAll`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/userroles/getItemsByUsername`,
    type: "JWT",
    method: "get",
  },
  {
    url: `/userroles/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/userroles/remove`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/userroles/getAll`,
    type: "JWT",
    method: "get",
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
    url: `/otp/validate`,
    type: "JWT",
    method: "post",
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
    url: `/userroles/changemytrainingsystemrole`,
    type: "JWT",
    method: "post",
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
    url: `/shielding/getCitizens`,
    type: "JWT",
    method: "get",
  },
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
  {
    url: `/teamprofiles/register`,
    type: "JWT",
    method: "post",
  },
  {
    url: `/teamprofiles/getAll`,
    type: "JWT",
    method: "get",
  },
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
  {
    url: `/teamprofiles/update`,
    type: "JWT",
    method: "put",
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
];
