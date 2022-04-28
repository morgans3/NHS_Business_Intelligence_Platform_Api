// @ts-check
const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");

const tablename = "virtual_ward_decision";

module.exports.getAll = function (limit, roles, callback) {
  const rolecheck = functions.checkRole(true, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = `SELECT * FROM public.` + tablename + rolecheck + ` LIMIT ` + limit;
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

module.exports.getAllActioned = function (limit, roles, callback) {
  const rolecheck = functions.checkRole(false, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = `SELECT * FROM public.` + tablename + ` WHERE ` + rolecheck + ` "status" NOT LIKE 'Pending' ORDER BY updated_date DESC LIMIT ` + limit;
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

module.exports.getAllByStatus = function (status, roles, limit, callback) {
  const rolecheck = functions.checkRole(false, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = `SELECT * FROM public.` + tablename + ` WHERE ` + rolecheck + ` "status" = '` + status + `' LIMIT ` + limit;
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

module.exports.updateStatus = function (id, status, nonreferral_reason, callback) {
  let reason = "";
  if (nonreferral_reason) {
    reason = ", nonreferral_reason='" + nonreferral_reason + "'";
  }
  const geoquery = `UPDATE public.` + tablename + ` SET status='` + status + `'` + reason + `, updated_date= CURRENT_TIMESTAMP WHERE id = '` + id + `'`;
  pool.query(geoquery, callback);
};

module.exports.updateContactInfo = function (id, contact, callback) {
  const geoquery = `UPDATE public.` + tablename + ` SET newcontact='` + contact + `' WHERE id = '` + id + `'`;
  pool.query(geoquery, callback);
};

module.exports.removeContactInfo = function (id, callback) {
  const geoquery = `UPDATE public.` + tablename + ` SET newcontact=NULL WHERE id = '` + id + `'`;
  pool.query(geoquery, callback);
};

module.exports.updateNotes = function (id, notes, callback) {
  const geoquery = `UPDATE public.` + tablename + ` SET notes='` + notes + `' WHERE id = '` + id + `'`;
  pool.query(geoquery, callback);
};

module.exports.removeNotes = function (id, callback) {
  const geoquery = `UPDATE public.` + tablename + ` SET notes=NULL WHERE id = '` + id + `'`;
  pool.query(geoquery, callback);
};
