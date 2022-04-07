// @ts-check
const pool = require("../config/database").pool;
const Services = require("../_credentials/govuk_info").Services;
const MainServices = require("../_credentials/govuk_info").MainServices;

module.exports.update = function (item, callback) {
  console.info("GOV UK Notify ACK---Receipt: " + JSON.stringify(item));
  // Log status against messageid === id
  const updatequery = `UPDATE public.virtualward_lightertouchpathway SET status='Message ` + item.status + `' WHERE messageid = '` + item.id + `'`;
  pool.query(updatequery, (err, res) => {
    if (err) console.error("ERROR:" + err + " --- Query:" + updatequery);

    // Update log table with messagecount based on info from receipt and Services
    const service = Services.find((x) => x.templateid === item.template_id);
    const servicecountlogquery = "INSERT INTO public.virtualward_servicecountlog (messageid, msgcount, organisation, servicename, type, period) VALUES ($1, $2, $3, $4, $5, $6)";
    const values = [item.id, service.msgcount, service.organisation, service.name, item.notification_type, item.sent_at];
    pool.query(servicecountlogquery, values, (innerErr, innerRes) => {
      if (innerErr) console.error("ERROR:" + innerErr + " --- Query:" + servicecountlogquery);
      callback(null, "success");
    });
  });
};

module.exports.getAllServiceCountLogs = function (callback) {
  const query = `SELECT logs.*, pathway.status FROM public.virtualward_servicecountlog as logs LEFT OUTER JOIN public.virtualward_lightertouchpathway as pathway ON logs.messageid = pathway.messageid`;
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

module.exports.updateGeneral = function (service, item, callback) {
  console.info("GOV UK Notify ACK---Receipt: " + JSON.stringify(item));
  const servicecountlogquery = "INSERT INTO public.notify_callbacks (messageid, msgcount, organisation, servicename, type, period, templateid, status, recipient) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
  const values = [item.id, service.msgcount, service.organisation, service.name, item.notification_type, item.sent_at, item.template_id, item.status, item.to];
  pool.query(servicecountlogquery, values, (innerErr, innerRes) => {
    if (innerErr) console.error("ERROR:" + innerErr + " --- Query:" + servicecountlogquery);
    callback(null, "success");
  });
};
