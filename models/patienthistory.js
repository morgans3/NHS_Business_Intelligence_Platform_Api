// @ts-check
const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");

module.exports.getAllPopulationHistory = function (limit, roles, callback) {
    const rolecheck = functions.checkRole(true, roles, "populationjoined");
    const query = "SELECT * FROM public.population_history " + rolecheck + " LIMIT " + limit;
    pool.query(query, (error, results) => {
        if (error) {
            console.log("Error: " + error);
            callback(error, null);
        } else if (results && results.rows) {
            callback(null, results.rows);
        } else {
            callback(null, null);
        }
    });
};

module.exports.getAllDistrictHistory = function (limit, roles, callback) {
    const rolecheck = functions.checkRole(true, roles, "populationjoined");
    const query = "SELECT * FROM public.district_history " + rolecheck + " LIMIT " + limit;
    pool.query(query, (error, results) => {
        if (error) {
            console.log("Error: " + error);
            callback(error, null);
        } else if (results && results.rows) {
            callback(null, results.rows);
        } else {
            callback(null, null);
        }
    });
};

module.exports.getPersonsPopulationHistoryByNHSNumber = function (nhsnumber, roles, callback) {
    const rolecheck = functions.checkRole(false, roles, "populationjoined");
    if (rolecheck === "" || rolecheck === "error") {
        callback(new Error("Invalid permissions"), null, {
            reason: "Access denied. Insufficient permissions to view any patients details.",
        });
    } else {
        const query = "SELECT * FROM public.population_history AS M WHERE " + rolecheck + ` "nhs_number" = $1`;
        pool.query(query, [nhsnumber], (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(null, error, null);
            } else if (results && results.rows) {
                callback(null, null, results.rows);
            } else {
                console.log("Error: " + error);
                callback(null, "No rows returned", null);
            }
        });
    }
};

module.exports.getPersonsDistrictHistoryByNHSNumber = function (nhsnumber, roles, callback) {
    const rolecheck = functions.checkRole(false, roles, "populationjoined");
    if (rolecheck === "" || rolecheck === "error") {
        callback(new Error("Invalid permissions"), null, {
            reason: "Access denied. Insufficient permissions to view any patients details.",
        });
    } else {
        const query = "SELECT * FROM public.district_history AS M WHERE " + rolecheck + ` "nhs_number" = $1`;
        pool.query(query, [nhsnumber], (error, results) => {
            if (error) {
                console.log("Error: " + error);
                callback(null, error, null);
            } else if (results && results.rows) {
                callback(null, null, results.rows);
            } else {
                console.log("Error: " + error);
                callback(null, "No rows returned", null);
            }
        });
    }
};
