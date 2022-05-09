const pool = require("../config/database").pool;

module.exports.getOutbreak = function (callback) {
    const pcgeoquery = `SELECT 'FeatureCollection' AS TYPE, array_to_json(array_agg(f)) AS features FROM
        ( SELECT 'Feature' AS TYPE, ST_AsGeoJSON (lg.geom, 4)::json AS geometry,
        row_to_json(row(id, "time", lat, lng, tme, optim_var), true) AS properties FROM public.isochrone_outbreak AS lg) AS f`;
    pool.query(pcgeoquery, callback);
};
