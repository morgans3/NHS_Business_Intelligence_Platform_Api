// @ts-check
const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");

module.exports.getAll = function (limit, roles, callback) {
  const rolecheck = functions.checkRole(true, roles, "population");
  const query = `SELECT * FROM public.population_master ` + rolecheck + ` LIMIT ` + limit;
  pool.query(query, (error, results) => {
    if (error) {
      console.log("Error: " + error);
      callback("Error:" + error, null);
    } else if (results && results.rows) {
      callback(null, results.rows);
    } else {
      callback("No rows returned", null);
    }
  });
};

module.exports.getPersonByNHSNumber = function (nhsnumber, roles, callback) {
  const rolecheck = functions.checkRole(false, roles, "population");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query =
      `SELECT
  sex AS Gender, nhs_number AS NHSNumber,
  address_line_1 AS AddressLine1,
  address_line_2 AS AddressLine2,
  address_line_3 AS AddressLine3,
  address_line_4 AS AddressLine4,
  address_line_5 AS AddressLine5,
  postcode AS PostCode, title AS Title,
  forename AS Forename, other_forenames AS OtherForenames,
  surname AS Surname, date_of_birth AS DOB
   FROM public.population_master WHERE ` +
      rolecheck +
      ` "nhs_number" = '` +
      nhsnumber +
      `'`;
    pool.query(query, (error, results) => {
      if (error) {
        console.log("Error: " + error);
        callback(null, error, null);
      } else if (results && results.rows && results.rows.length > 0) {
        callback(null, null, results.rows);
      } else {
        this.checkHistory(query, callback);
      }
    });
  }
};

module.exports.checkHistory = function (query, callback) {
  pool.query(query.replace("public.population_master", "public.population_history"), (error, results) => {
    if (error) {
      console.log("Error: " + error);
      callback(null, error, null);
    } else if (results && results.rows && results.rows.length > 0) {
      callback(null, null, results.rows);
    } else {
      console.log("Error: " + error);
      callback(null, "No rows returned", null);
    }
  });
};

module.exports.validateNHSNumber = function (nhsnumber, roles, dateofbirth, callback) {
  let input = null;
  this.getPersonByNHSNumber(nhsnumber, roles, (security, err, data) => {
    if (err) {
      console.log("Error: " + err);
      callback(err, null);
    } else {
      if (data && data.length === 0) {
        input = { success: false, msg: "NHS Number not found." };
      } else if (data && data.length > 0) {
        if (dobMatch(data[0], dateofbirth)) {
          input = { success: true, msg: "Valid" };
        } else {
          input = { success: false, msg: "NHS Number found, not a match with Date of Birth provided." };
        }
        callback(null, input);
      } else {
        callback(null, input);
      }
    }
  });
};

function dobMatch(patient, date) {
  if (patient["dob"]) {
    if (patient["dob"].toISOString().indexOf(date) > -1) return true;
    else return false;
  } else {
    return false;
  }
}
