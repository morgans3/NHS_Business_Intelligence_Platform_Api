// @ts-check
const pool = require("../config/database").pool;
const async = require("async");
const tablename = "docobo_patients";
const satstablename = "docobo_osats_landing";

module.exports.addPatient = function (orgcode, patientId, resource, callback) {
  const nhs = resource.nhsNumber.toString().split(" ").join("");
  const values = [orgcode, nhs, patientId, resource.dischargeDestination, resource.offBoardingDate, resource.onBoardingDate, resource.referralSource, resource.selfDischarge, resource.serviceType, resource.patientDied];
  const geoquery = `INSERT INTO public.` + tablename + ` ("orgcode", "nhsNumber", "patientId", "dischargeDestination", "offBoardingDate", "onBoardingDate", "referralSource", "selfDischarge", "serviceType", "patientDied") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
  pool.query(geoquery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      if (resource.osSats && resource.osSats.length > 0) {
        updateO2Stats(patientId, resource.osSats, callback);
      } else {
        callback(null, result);
      }
    }
  });
};

function updateO2Stats(patientId, resource, callback) {
  const delquery = `DELETE FROM public.` + satstablename + ` WHERE "patientId"='` + patientId + `'`;
  pool.query(delquery, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      let gberror = "";
      const geoquery = `INSERT INTO public.` + satstablename + `("patientId", "measurmentDateTime", "o2Sat") VALUES ($1, $2, $3) RETURNING *`;
      async.mapSeries(
        resource,
        (values, outerCB) => {
          const vars = [patientId, values.measurmentDateTime, values.o2Sat];
          pool.query(geoquery, vars, outerCB);
        },
        function (err, results) {
          if (err) {
            callback(err, gberror);
          } else {
            callback(null, true);
          }
        }
      );
    }
  });
}

module.exports.updateO2Stats = updateO2Stats;

module.exports.updatePatient = function (orgcode, patientId, resource, callback) {
  const values = [orgcode, resource.nhsNumber, resource.dischargeDestination, resource.offBoardingDate, resource.onBoardingDate, resource.referralSource, resource.selfDischarge, resource.serviceType, resource.patientDied];
  const geoquery =
    `UPDATE public.` +
    tablename +
    ` SET orgcode=$1, "nhsNumber"=$2, "dischargeDestination"=$3,
  "offBoardingDate"=$4, "onBoardingDate"=$5, "referralSource"=$6,
  "selfDischarge"=$7, "serviceType"=$8, "patientDied"=$9
  WHERE "patientId"='` +
    patientId +
    `'`;
  pool.query(geoquery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      if (resource.osSats && resource.osSats.length > 0) {
        updateO2Stats(patientId, resource.osSats, callback);
      } else {
        callback(null, result);
      }
    }
  });
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

module.exports.getActive = function (callback) {
  const query = `SELECT * FROM public.` + tablename + ` WHERE "offBoardingDate" IS NULL`;
  pool.query(query, (error, results) => {
    if (error) {
      console.log("Error: " + error);
      callback("Error:" + error, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports.getO2StatsByPatientID = function (name, callback) {
  const geoquery = `SELECT * FROM public.` + satstablename + ` WHERE "patientId" ='` + name + `';`;
  pool.query(geoquery, callback);
};

module.exports.getByNHSNumber = function (name, callback) {
  const geoquery = `SELECT * FROM public.` + tablename + ` WHERE nhsNumber ='` + name + `';`;
  pool.query(geoquery, callback);
};

module.exports.compareObject = function (objA, objB) {
  let flag = true;
  if (objB.nhsNumber !== undefined && objA.nhsNumber.split(" ").join("") !== objB.nhsNumber.split(" ").join("")) {
    flag = false;
  }
  if (objA.offBoardingDate !== undefined && objB.offBoardingDate !== undefined) {
    if (objA.offBoardingDate === null && objB.offBoardingDate !== null) flag = false;
    else if (objA.offBoardingDate === null && objB.offBoardingDate === null) flag = true;
    else if (objA.offBoardingDate.toISOString().substring(0, 10) !== objB.offBoardingDate) {
      flag = false;
    }
  }
  if (objA.onBoardingDate !== undefined && objB.onBoardingDate !== undefined) {
    if (objA.onBoardingDate === null && objB.onBoardingDate !== null) flag = false;
    else if (objA.onBoardingDate === null && objB.onBoardingDate === null) flag = true;
    else if (objA.onBoardingDate.toISOString().substring(0, 10) !== objB.onBoardingDate) {
      flag = false;
    }
  }
  if (objB.patientDied !== undefined && objA.patientDied !== objB.patientDied) {
    flag = false;
  }
  if (objB.referralSource !== undefined && objA.referralSource !== objB.referralSource) {
    flag = false;
  }
  if (objB.selfDischarge !== undefined && objA.selfDischarge !== objB.selfDischarge) {
    flag = false;
  }
  if (objB.dischargeDestination !== undefined && objA.dischargeDestination !== objB.dischargeDestination) {
    flag = false;
  }
  if (objB.osSats && objB.osSats.length > 0) flag = false;
  return flag;
};
