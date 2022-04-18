// @ts-check

const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");

module.exports.getAll = function (tablename, limit, roles, callback) {
  const rolecheck = functions.checkRole(true, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = `SELECT * FROM public.` + tablename + rolecheck + ` LIMIT ` + limit;
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error: " + error);
        callback(null, "Error:" + error, null);
      } else if (results && results.rows) {
        callback(null, null, results.rows);
      } else {
        callback(null, "No rows returned", null);
      }
    });
  }
};

module.exports.update = function (tablename, item, uid, callback) {
  const values = [];
  let statement = "";
  let index = 1;
  Object.keys(item).forEach((col) => {
    if (col !== "uid") {
      values.push(item[col]);
      statement += col + "=$" + index.toString() + " ,";
    }
    index++;
  });
  if (statement.length > 0) statement = statement.substring(0, statement.length - 2);
  const geoquery = `UPDATE public.` + tablename + ` SET ` + statement + ` WHERE uid = ` + uid + ``;
  pool.query(geoquery, values, callback);
};

module.exports.checkNewData = function (callback) {
  const query = `SELECT loaded_date FROM public.virtual_ward_decision
    WHERE loaded_date::date > (SELECT runtime from public.virtualward_scriptlogging ORDER by runtime DESC LIMIT 1)::date
    ORDER by loaded_date
    DESC LIMIT 1;`;
  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error: " + error);
      callback(error, "Error:" + error);
    } else if (results && results.rows && results.rows.length > 0) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
};

module.exports.getNewList = function (callback) {
  const query = `SELECT nhs_number, ccg_code, phone_number as contact, specimen_date, gpp_code, "id", age_in_years, ethnicity, age_band, forename, surname, postcode, date_of_birth FROM public.virtual_ward_decision as dec
  WHERE specimen_date::date > current_date - interval '8' day
  and ccg_code IN ('00R', '02M', '01H', '01K', '00X', '01E')
  and age_in_years > 18
  and recommendation = 'RS Lower Risk' -- RS Greater Risk
  and NOT EXISTS (SELECT nhs_number FROM virtualward_lightertouchpathway WHERE nhs_number = dec.nhs_number)
  ORDER BY specimen_date DESC`;
  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error: " + error);
      callback(error, "Error:" + error);
    } else if (results && results.rows) {
      callback(null, results.rows);
    } else {
      callback(null, []);
    }
  });
};
