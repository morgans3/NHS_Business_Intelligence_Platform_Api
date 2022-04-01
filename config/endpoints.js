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
];
