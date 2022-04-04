// @ts-check
const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");

const select = `WITH p AS (
  SELECT
    postcode,
    la,
    utla
  FROM
    postcode_to_utla
  )
  SELECT
    *
  FROM
    nsss_master n
  LEFT JOIN p ON
    n.address_postcode = p.postcode`;

module.exports.getAll = function (limit, roles, callback) {
  const rolecheck = functions.checkRole(true, roles, "populationshielding");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = select + rolecheck + ` LIMIT ` + limit;
    pool.query(query, (error, results) => {
      if (error) {
        console.log("Error: " + error);
        callback(null, "Error:" + error, null);
      } else if (results && results.rows) {
        callback(null, null, results.rows);
      } else {
        callback(null, "No rows returned", null);
      }
    });
  }
};
