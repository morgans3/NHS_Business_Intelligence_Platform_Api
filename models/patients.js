// @ts-check
const pool = require("../config/database").pool;
const functions = require("../helpers/role_functions");

const selectjoin = `SELECT
M.*,
D.local_authority_name as D_local_authority_name, D.gpp_code as D_gpp_code,
D.practice as D_practice, D.age as D_age, D.age_category as D_age_category,
D.sex as D_sex, D.date_of_birth as D_date_of_birth, D.date_of_death as D_date_of_death,
D.title as D_title, D.forename as D_forename, D.other_forenames as D_other_forenames,
D.surname as D_surname, D.address_line_1 as D_address_line_1, D.address_line_2 as D_address_line_2,
D.address_line_3 as D_address_line_3, D.address_line_4 as D_address_line_4, D.address_line_5 as D_address_line_5,
D.postcode as D_postcode, D.ward_name as D_ward_name, D.landline as D_landline, D.mobile as D_mobile,
D.other_shielded_category as D_other_shielded_category, D.assisted_collection as D_assisted_collection,
D.home_care_link as D_home_care_link, D.single_occupancy as D_single_occupancy, D.number_of_occupants as D_number_of_occupants,
D.disabled_facilities_grant as D_disabled_facilities_grant, D.council_tax as D_council_tax, D."neighbourhood_linked_to_PCN" as D_neighbourhood_linked_to_PCN,
D.universal_credit as D_universal_credit, D.housing_benefit as D_housing_benefit, D.business_grant as D_business_grant, D.result as D_result,
D.reason as D_reason, D.contact_date as D_contact_date, D.district as D_district, D.etl_run_date as D_etl_run_date, D.nhs_number as D_nhs_number
FROM
public.population_master M
LEFT JOIN public.district_master D
using(nhs_number)`;
const nonestatement = `M.asthma IS NOT TRUE AND M.chd IS NOT TRUE AND M.heart_failure IS NOT TRUE AND M.cancer IS NOT TRUE AND M.copd IS NOT TRUE AND
M.depression IS NOT TRUE AND M.diabetes IS NOT TRUE AND M.hypertension IS NOT TRUE AND M.atrial_fibrillation IS NOT TRUE AND
M.ckd IS NOT TRUE AND M.dementia IS NOT TRUE AND M.epilepsy IS NOT TRUE AND M.hypothyroid IS NOT TRUE AND M.mental_health IS NOT TRUE AND
M.learning_disabilities IS NOT TRUE AND M.osteoporosis IS NOT TRUE AND M.pad IS NOT TRUE AND
M.rheumatoid_arthritis IS NOT TRUE AND M.stroke_tia IS NOT TRUE AND M.palliative_care_flag IS NOT TRUE AND M.psychotic_disorder_flag IS NOT TRUE AND
M.spl IS NOT TRUE AND M.chemo_radiotherapy IS NOT TRUE AND M.haematological_cancers IS NOT TRUE AND M.rare_diseases IS NOT TRUE AND M.respiratory IS NOT TRUE`;
const noneflagstatement = `D.other_shielded_category IS NULL AND D.assisted_collection IS NULL AND D.home_care_link IS NOT TRUE AND
D.single_occupancy IS NULL AND D.disabled_facilities_grant IS NOT TRUE AND D.council_tax IS NULL AND D."neighbourhood_linked_to_PCN"
IS NOT TRUE AND D.universal_credit IS NOT TRUE AND D.housing_benefit IS NOT TRUE AND D.business_grant IS NOT TRUE`;

module.exports.getAll = function (limit, roles, callback) {
  const rolecheck = functions.checkRole(true, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = selectjoin + rolecheck + ` LIMIT ` + limit;
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

module.exports.getAllByCohort = function (limit, cohort, roles, callback) {
  const rolecheck = functions.checkRole(false, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = selectjoin + ` WHERE ` + rolecheck + cohortClause(cohort) + ` LIMIT ` + limit;
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

module.exports.getPersonByNHSNumber = function (nhsnumber, roles, callback) {
  const rolecheck = functions.checkRole(false, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = selectjoin + ` WHERE ` + rolecheck + ` "nhs_number" = '` + nhsnumber + `'`;
    pool.query(query, (error, results) => {
      if (error) {
        console.log("Error: " + error);
        callback(null, error, null);
      } else if (results && results.rows && results.rows.length > 0) {
        callback(null, null, results.rows);
      } else {
        this.getHistoryByNHSNumber(nhsnumber, roles, callback);
      }
    });
  }
};

module.exports.getHistoryByNHSNumber = function (nhsnumber, roles, callback) {
  const rolecheck = functions.checkRole(false, roles, "populationjoined");
  if (rolecheck === "" || rolecheck === "error") {
    callback(true, null, { reason: "Access denied. Insufficient permissions to view any patients details." });
  } else {
    const query = selectjoin.replace("public.population_master", "public.population_history") + ` WHERE ` + rolecheck + ` "nhs_number" = '` + nhsnumber + `'`;
    pool.query(query, (error, results) => {
      if (error) {
        console.log("Error: " + error);
        callback(null, error, null);
      } else if (results && results.rows) {
        callback(null, null, results.rows);
      } else {
        callback(null, "No rows returned", null);
      }
    });
  }
};

module.exports.findMyNHSNumber = function (resource, callback) {
  let query = `SELECT nhs_number FROM public.population_master WHERE "sex"='` + resource.gender.substring(0, 1) + `' AND "postcode"='` + resource.postcode + `' AND "date_of_birth"='` + resource.dob + `' LIMIT 1;`;
  if (resource.forename) {
    query = `SELECT nhs_number FROM public.population_master WHERE "sex"='` + resource.gender.substring(0, 1) + `' AND "forename" ILIKE '` + resource.forename + `' AND "postcode"='` + resource.postcode + `' AND "date_of_birth"='` + resource.dob + `' LIMIT 1;`;
  }
  pool.query(query, (error, results) => {
    if (error) {
      console.log("Error: " + error);
      callback(error, null);
    } else if (results && results.rows.length > 0) {
      callback(null, results.rows);
    } else {
      this.checkHistoryTableforNHSNumber(resource, callback);
    }
  });
};

module.exports.checkHistoryTableforNHSNumber = function (resource, callback) {
  let query = `SELECT nhs_number FROM public.population_history WHERE "sex"='` + resource.gender.substring(0, 1) + `' AND "postcode"='` + resource.postcode + `' AND "date_of_birth"='` + resource.dob + `' LIMIT 1;`;
  if (resource.forename) {
    query = `SELECT nhs_number FROM public.population_history WHERE "sex"='` + resource.gender.substring(0, 1) + `' AND "forename" ILIKE '` + resource.forename + `' AND "postcode"='` + resource.postcode + `' AND "date_of_birth"='` + resource.dob + `' LIMIT 1;`;
  }
  pool.query(query, (error, results) => {
    if (error) {
      console.log("Error: " + error);
      callback(error, null);
    } else if (results && results.rows.length > 0) {
      callback(null, results.rows);
    } else {
      callback("No rows returned", null);
    }
  });
};

const exclusions = ["FCntDimension", "LCntDimension", "numberSelFlag", "numberSelLtc", "DDimension", "MDimension"];

function cohortClause(cohorturl) {
  if (cohorturl === "" || cohorturl === null || cohorturl === "{}") {
    return "";
  } else {
    let statement = "";
    console.log(cohorturl);
    const ch = JSON.parse(cohorturl);
    const keys = Object.keys(ch);
    keys.forEach((k) => {
      if (exclusions.indexOf(k) === -1) statement += convertKeytoField(k) + convertValuetoSQL(k, ch[k]) + " AND ";
    });
    statement = statement.substr(0, statement.length - 4);
    return ` (` + statement + `) `;
  }
}

function convertKeytoField(dimensionName) {
  switch (dimensionName) {
    case "SexDimension":
      return `M.sex`;
      break;
    case "AgeDimension":
      return `M.age`;
      break;
    case "RskDimension":
      return `M.risk_score_int`;
      break;
    case "WDimension":
      return `M.electoral_ward_or_division`;
      break;
    case "GPDimension":
      return `M.gpp_code`;
      break;
    case "LDimension":
      return `M.pcn`;
      break;
    case "CCGDimension":
      return `M.ccg_code`;
      break;
    case "LTCs2Dimension":
    case "MatrixDimension":
    case "Flags2Dimension":
      return ``;
      break;
    default:
      return `"nhs_number"`;
  }
}

function convertValuetoSQL(dimensionName, value) {
  console.log(value);
  switch (dimensionName) {
    case "SexDimension":
    case "LDimension":
    case "GPDimension":
      if (value.length === 0) return " IS NOT NULL ";
      else if (value.length === 1) return ` = '` + value[0] + `'`;
      else {
        let list = ` in (`;
        value.forEach((element) => {
          list += `'` + element + `',`;
        });
        return list.substr(0, list.length - 1) + `)`;
      }
      break;
    case "WDimension":
    case "CCGDimension":
      if (value.length === 0) return " IS NOT NULL ";
      else if (value.length === 1) return ` = '` + value[0] + `'`;
      else {
        let list = ` in (`;
        value.forEach((element) => {
          list += `'` + element + `',`;
        });
        return list.substr(0, list.length - 1) + `)`;
      }
      break;
    case "AgeDimension":
      return ` >= ` + value[0][0] + ` AND M.age <= ` + value[0][1];
      break;
    case "RskDimension":
      return ` >= ` + value[0][0] + ` AND M.risk_score_int <= ` + value[0][1];
      break;
    case "LTCs2Dimension":
      let noneflag = false;
      value.forEach((element) => {
        if (element[0] === "None") noneflag = true;
      });
      if (noneflag) {
        return "(" + nonestatement + ")";
      } else {
        let statement = " (";
        value.forEach((element) => {
          const lookup = LTCLookup.filter((x) => x.displayName === element[0]);
          if (lookup.length > 0) {
            statement += lookup[0].dbname + " IS TRUE AND ";
          } else {
            statement += element[0].toLowerCase().split(" ").join("_") + " IS TRUE AND ";
          }
        });
        return statement.substr(0, statement.length - 4) + `)`;
      }
      break;
    case "Flags2Dimension":
      let noneflag2 = false;
      value.forEach((element) => {
        if (element[0] === "None") noneflag2 = true;
      });
      if (noneflag2) {
        return "(" + noneflagstatement + ")";
      } else {
        let statement2 = " (";
        value.forEach((element) => {
          const lookup = FlagLookup.filter((x) => x.displayName === element[0]);
          if (lookup.length > 0) {
            statement2 += lookup[0].dbname + lookup[0].truth + " AND ";
          } else {
            statement2 += element[0].toLowerCase().split(" ").join("_") + " IS TRUE AND ";
          }
        });
        return statement2.substr(0, statement2.length - 4) + `)`;
      }
      break;
    case "MatrixDimension":
      let whereClause = "";
      value.forEach((valuePair, i) => {
        if (valuePair[0] && valuePair[1]) {
          whereClause += `covid_risk like '${valuePair[0]}' AND covid_vuln like '${valuePair[1]}'`;
          // Not the first pair and not the last do we add the `AND`
          if (value.length > 1 && i !== value.length - 1) {
            whereClause += ` AND `;
          }
        }
      });
      whereClause = ` (${whereClause}) `;
      return whereClause;
      break;
    default:
      return " = '0000000000'";
  }
}

const LTCLookup = [
  { dbname: "chd", displayName: "Coronary Artery Disease" },
  { dbname: "heart_failure", displayName: "Congestive Heart Failure" },
  { dbname: "ckd", displayName: "Chronic Kidney Disease" },
  { dbname: "pad", displayName: "Peripheral Artery Disease" },
];

const FlagLookup = [
  { dbname: "D.other_shielded_category", displayName: "District Shielded", truth: " = 1" },
  { dbname: "D.assisted_collection", displayName: "Assisted Bin Collection", truth: " = 'Y'" },
  { dbname: "D.home_care_link", displayName: "Home Care Link", truth: " IS TRUE" },
  { dbname: "D.single_occupancy", displayName: "Single Occupancy", truth: " = 'Y'" },
  { dbname: "D.disabled_facilities_grant", displayName: "Disabled Facilities Grant", truth: " IS TRUE" },
  { dbname: "D.council_tax", displayName: "Council Tax", truth: " = 'Y'" },
  { dbname: 'D."neighbourhood_linked_to_PCN"', displayName: "Neighbourhood Linked to PCN", truth: " IS TRUE" },
  { dbname: "D.universal_credit", displayName: "Universal Credit", truth: " IS TRUE" },
  { dbname: "D.housing_benefit", displayName: "Housing Benefit", truth: " IS TRUE" },
  { dbname: "D.business_grant", displayName: "Business Grant", truth: " IS TRUE" },
];
