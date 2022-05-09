// @ts-check
const Request = require("request");
const credentials = require("../_credentials/credentials");
const { compareObject, updatePatient, addPatient, getActive, getAll } = require("./docobopatients");
const docoboOutbound = credentials.docobo.outboundkey;
const docoboServer = credentials.docobo.server || "uk-4a-ni-uat.docobo.net";
const endpoint = "https://" + docoboServer + "/KeswickThirdPartyInterface/";
const async = require("async");
const access = process.env.AWSPROFILE || "Dev";

const uatOrglist = ["5505182964", "5922398076"];
const liveOrglist = [
    "6097183707",
    "9014395219",
    "9987637186",
    "7913324276",
    "1385362645",
    "6932813927",
    "5542456849",
    "4881826291",
    "2904548692",
    "5959271955",
    "1238682516",
    "6379081324",
    "6379081324",
    "9852019690",
    "3738178916",
    "4046296072",
    "1100470766",
    "7628232392",
    "8465956876",
    "7789069427",
    "1517585873",
    "4734946161",
    "8045347507",
    "8353464663",
    "8462862618",
    "4990924248",
    "9234445443",
    "9323012374",
    "2208530225",
    "2352116097",
    "5407839350",
    "3876190665",
    "7349829033",
    "5298941400",
    "9296492830",
    "5824454467",
    "7766744144",
    "4232798312",
    "9567727815",
    "6094489443",
    "8269331929",
    "3456981293",
    "3039766186",
    "1177675050",
    "3753935818",
    "8770079774",
    "7225174186",
    "1532642771",
    "5004481147",
    "8477819510",
    "5943975121",
    "2687792726",
    "6160931092",
    "9632669464",
    "4170550929",
    "7642689298",
    "4587166037",
    "4708826626",
];

module.exports.extractInfoFromDocobo = (callback) => {
    this.updateCurrentDocoboData((err, result) => {
        if (err) callback(err, null);
        else {
            let orglist = liveOrglist;
            if (access === "Dev") orglist = uatOrglist;
            getAll((error, patientList) => {
                if (error) callback(error, "Current active Patients updated, unable to check for new.");
                else {
                    const gberror = "";
                    async.mapSeries(
                        orglist,
                        (orgcode, outerCB) => {
                            this.getDocoboPatientList(orgcode, (errPL, dcbList) => {
                                if (errPL) {
                                    outerCB(
                                        errPL,
                                        "Current active Patients updated, unable to check for patients of organisation " + orgcode
                                    );
                                } else {
                                    if (dcbList && dcbList.patients && dcbList.patients.length > 0) {
                                        const newlist = dcbList.patients.filter(
                                            (x) => patientList.rows.filter((y) => y.patientId === x.patientId).length === 0
                                        );
                                        this.addNewPatients(orgcode, newlist, (errAN, resAN) => {
                                            if (errAN) outerCB(errAN, "Adding new patients failed");
                                            else outerCB();
                                        });
                                    } else outerCB();
                                }
                            });
                        },
                        (errExtract, results) => {
                            if (errExtract) {
                                callback(errExtract, gberror);
                            } else {
                                callback(null, "All data stored successfully");
                            }
                        }
                    );
                }
            });
        }
    });
};

module.exports.getDocoboPatientList = (orgcode, callback) => {
    Request.post(
        {
            headers: { "content-type": "application/json", Authorization: docoboOutbound },
            url: endpoint + "WcfServices/BulkPatientExportData.svc/getpatients/" + orgcode,
        },
        (error, response, body) => {
            if (error) {
                callback(error, false);
            } else {
                if (body && body.length > 0) {
                    callback(null, JSON.parse(body));
                } else {
                    callback(null, null);
                }
            }
        }
    );
};

module.exports.updateCurrentDocoboData = (callback) => {
    getActive((err, result) => {
        if (err) {
            callback(err, null);
        } else {
            if (result.rows && result.rows.length > 0) {
                const gberror = "";
                async.mapSeries(
                    result.rows,
                    (values, outerCB) => {
                        this.checkPatient(values, outerCB);
                    },
                    (errUpdate, results) => {
                        if (errUpdate) {
                            callback(errUpdate, gberror);
                        } else {
                            callback(null, results);
                        }
                    }
                );
            } else {
                callback(null, []);
            }
        }
    });
};

module.exports.checkPatient = (curr, callback) => {
    Request.post(
        {
            headers: { "content-type": "application/json", Authorization: docoboOutbound },
            url: endpoint + "WcfServices/BulkPatientExportData.svc/getpatientdata/" + curr.patientId,
        },
        (error, response, body) => {
            if (error) {
                callback(error, false);
            } else {
                if (body && body.length > 0) {
                    const res = JSON.parse(body);
                    if (compareObject(curr, res)) {
                        callback(null, true);
                    } else {
                        console.log("Change identified, updating: " + curr.patientId);
                        updatePatient(curr.orgcode, curr.patientId, res, callback);
                    }
                } else {
                    callback(null, null);
                }
            }
        }
    );
};

module.exports.addNewPatients = (orgcode, newpatients, callback) => {
    const gberror = "";
    async.mapSeries(
        newpatients,
        (values, outerCB) => {
            Request.post(
                {
                    headers: { "content-type": "application/json", Authorization: docoboOutbound },
                    url: endpoint + "WcfServices/BulkPatientExportData.svc/getpatientdata/" + values.patientId,
                },
                (error, response, body) => {
                    if (error) {
                        outerCB(error, false);
                    } else {
                        if (body && body.length > 0) {
                            const res = JSON.parse(body);
                            addPatient(orgcode, values.patientId, res, outerCB);
                        } else {
                            outerCB(error, "Patient record does not exist in Docobo");
                        }
                    }
                }
            );
        },
        (err, results) => {
            if (err) {
                callback(err, gberror);
            } else {
                callback(null, true);
            }
        }
    );
};
