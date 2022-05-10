const pool = require("../config/database").pool;
const lookups = require("./data/postcodelookups.json");

module.exports.getPostcodes = function (callback) {
    const pcgeoquery = `SELECT
        'FeatureCollection' AS TYPE,
        array_to_json(array_agg(f)) AS features
    FROM (
        SELECT
            'Feature' AS TYPE,
            ST_AsGeoJSON (ST_Simplify (lg.geom, 0.0001, TRUE), 4)::json AS geometry,
            row_to_json(row(mostype, pop), true) AS properties
        FROM
            mosaicpostcode AS lg)
    AS f`;
    pool.query(pcgeoquery, callback);
};

module.exports.getPostcodeLookups = function (callback) {
    callback(null, lookups);
};
