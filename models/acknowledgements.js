// @ts-check
const pool = require("../config/database").pool;
const tablename = "docobo_acknowledgements";

module.exports.addResource = function (resource, callback) {
  const values = [resource.importFileName, resource.nhsNumber, resource.isEnrolled, resource.error, resource.rowNumber];
  const geoquery = `INSERT INTO public.` + tablename + `("importFileName", nhs_number, "isEnrolled", error, "rowNumber") VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  pool.query(geoquery, values, callback);
};

module.exports.getAll = function (callback) {
  const query = `SELECT * FROM public.` + tablename;
  pool.query(query, (error, results) => {
    if (error) {
      console.log("Error: " + error);
      callback("Error:" + error, null);
    } else {
      callback(null, results);
    }
  });
};