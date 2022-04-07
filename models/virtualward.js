// @ts-check

const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");
const NotifyClient = require("notifications-node-client").NotifyClient;
const Services = require("../_credentials/govuk_info").Services;
const async = require("async");

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

module.exports.getAllScripts = function (callback) {
    const query = `SELECT * FROM public.virtualward_scriptlogging`;
    pool.query(query, (error, results) => {
        if (error) {
            console.error("Error: " + error);
            callback(null, "Error:" + error);
        } else if (results && results.rows) {
            callback(null, results.rows);
        } else {
            callback(null, []);
        }
    });
};

module.exports.getAllManualLogs = function (callback) {
    const query = `SELECT * FROM public.virtualward_manuallogging`;
    pool.query(query, (error, results) => {
        if (error) {
            console.error("Error: " + error);
            callback(null, "Error:" + error);
        } else if (results && results.rows) {
            callback(null, results.rows);
        } else {
            callback(null, []);
        }
    });
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

module.exports.registerScriptSummary = function (item, callback) {
    const geoquery = `INSERT INTO public.virtualward_scriptlogging (summary, messagecount) VALUES ($1, $2)`;
    const values = [item.summary, item.messagecount];
    pool.query(geoquery, values, callback);
};

module.exports.registerManualLog = function (item, username, organisation, callback) {
    const geoquery = `INSERT INTO public.virtualward_manuallogging (nhs_number, contact, username, organisation, messageid) VALUES ($1, $2, $3, $4, $5)`;
    const values = [item.nhs_number, item.contact, username, organisation, item.messageid];
    pool.query(geoquery, values, callback);
};

module.exports.registerLTPRecord = function (item, callback) {
    const geoquery = `INSERT INTO public.virtualward_lightertouchpathway (nhs_number, demographics, contact, specimen_date, messagesent, messageid, status, ccg_code, gpp_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    const values = [item.nhs_number, item.demographics, item.contact, item.specimen_date, item.messagesent, item.messageid, item.status, item.ccg_code, item.gpp_code];
    pool.query(geoquery, values, callback);
};

module.exports.sendMessage = function (orgcode, phone, callback) {
    const creds = Services.find((x) => x.organisation == orgcode);
    if (creds) {
        const notifyClient = new NotifyClient(creds.apikey);
        notifyClient
            // @ts-ignore
            .sendSms(creds.templateid, phone, {
                personalisation: { telephone: creds.telephone },
                reference: null,
            })
            .then((response) => {
                callback(null, {
                    success: true,
                    msg: response,
                });
            })
            .catch((err) => {
                callback(err, {
                    success: false,
                    msg: "Failed, reason: " + err,
                });
            });
    } else {
        console.error("ERROR: Unable to send messages for this organisation");
        callback("ERROR: Unable to send messages for this organisation", {
            success: false,
            msg: "ERROR: Unable to send messages for this organisation",
        });
    }
};

module.exports.completeScript = function (info, count, callback) {
    const report = {
        summary: info,
        messagecount: count,
    };
    this.registerScriptSummary(report, (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, { success: true, msg: "Script completed successfully. Sent " + count + " messages." });
    });
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

module.exports.sendMessagesToCitizens = function (patientlist, callback) {
    async.mapSeries(
        patientlist,
        (patient, innerCB) => {
            if (patient.contact) {
                this.sendMessage(patient.ccg_code, patient.contact, (sendErr, sendRes) => {
                    if (sendErr) {
                        console.error("ERROR: " + JSON.stringify(patient) + " --- ", sendErr);
                        const item = {
                            nhs_number: patient.nhs_number,
                            demographics: JSON.stringify(patient),
                            contact: patient.contact,
                            specimen_date: patient.specimen_date,
                            ccg_code: patient.ccg_code,
                            gpp_code: patient.gpp_code,
                            status: "Failed",
                            messagesent: false,
                            messageid: null,
                        };
                        this.registerLTPRecord(item, (registererr, registerresult) => {
                            if (registererr) console.error("ERROR: " + JSON.stringify(item) + " --- ", registererr);
                            innerCB(null, registerresult);
                        });
                    } else {
                        const item = {
                            nhs_number: patient.nhs_number,
                            demographics: JSON.stringify(patient),
                            contact: patient.contact,
                            specimen_date: patient.specimen_date,
                            ccg_code: patient.ccg_code,
                            gpp_code: patient.gpp_code,
                            status: "Sent Invite",
                            messagesent: true,
                            messageid: sendRes.msg.data.id,
                        };
                        this.registerLTPRecord(item, (registererr, registerresult) => {
                            if (registererr) console.error("ERROR: " + JSON.stringify(item) + " --- ", registererr);
                            innerCB(null, registerresult);
                        });
                    }
                });
            } else {
                const item = {
                    nhs_number: patient.nhs_number,
                    demographics: JSON.stringify(patient),
                    contact: patient.contact,
                    specimen_date: patient.specimen_date,
                    ccg_code: patient.ccg_code,
                    gpp_code: patient.gpp_code,
                    status: "Failed",
                    messagesent: false,
                    messageid: null,
                };
                this.registerLTPRecord(item, (registererr, registerresult) => {
                    if (registererr) console.error("ERROR: " + JSON.stringify(item) + " --- ", registererr);
                    innerCB(null, registerresult);
                });
            }
        },
        (err, result) => {
            callback(null, result);
        }
    );
};

module.exports.getLTPCitizenFromID = function (uid, callback) {
    const query = `SELECT * FROM public.virtualward_lightertouchpathway WHERE uid = ` + uid + ``;
    pool.query(query, (error, results) => {
        if (error) {
            console.error("Error: " + error);
            callback(null, "Error:" + error);
        } else if (results && results.rows && results.rows.length > 0) {
            callback(null, results.rows[0]);
        } else {
            callback(null, null);
        }
    });
};

module.exports.manuallySendMessage = function (phonenumber, uid, callback) {
    this.getLTPCitizenFromID(uid, (err, patient) => {
        if (err) {
            callback(err, null);
        } else {
            if (patient) {
                this.sendMessage(patient.ccg_code, phonenumber, (sendErr, sendRes) => {
                    if (sendErr) {
                        callback(sendErr, { success: false, msg: "Error: unable to send to this number. Reason: " + sendErr });
                    } else {
                        const item = {
                            nhs_number: patient.nhs_number,
                            demographics: JSON.stringify(patient),
                            contact: phonenumber,
                            specimen_date: patient.specimen_date,
                            ccg_code: patient.ccg_code,
                            gpp_code: patient.gpp_code,
                            status: "Sent Invite",
                            messagesent: sendRes.success,
                            messageid: sendRes.msg.data.id || "",
                        };
                        this.update("virtualward_lightertouchpathway", item, uid, (registererr, registerresult) => {
                            if (registererr) console.error("ERROR: " + JSON.stringify(item) + " --- ", registererr);
                            callback(registererr, { success: sendRes.sucess, msg: sendRes.msg.data.id || "" });
                        });
                    }
                });
            } else {
                callback(null, { success: false, msg: "Patient entry does not exist" });
            }
        }
    });
};
