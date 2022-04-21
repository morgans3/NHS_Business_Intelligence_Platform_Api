// @ts-check

const pool = require("../config/database").pool;

module.exports.getAll = function (callback) {
  const geoquery = `WITH AllVarsConcatTypeAndName AS
  (
     SELECT
        "VarId",
        concat('"', "VariableGroup", '"', ':', value) Vars
     FROM
        public.mosaic_grand_index
     WHERE
        LENGTH("VariableGroup") = 3
     ORDER BY
        "row.names"
  ),
  ConcatGroups as
  (
     SELECT
        "VarId",
        concat('{', string_agg(Vars, ', '), '}' ) AS AllVarsJson
     FROM
        AllVarsConcatTypeAndName
     GROUP BY
        "VarId"
  ),
  AllVarsDesc as
  (
     SELECT DISTINCT
        "VarId",
        "Category",
        "Topic",
        "VariableName"
     FROM
        public.mosaic_grand_index
     ORDER BY
        "VarId"
  ),
  topicId AS
  (
     SELECT
        "Category",
        "Topic",
        MIN(CAST("row.names" AS INT) ) TopId
     FROM
        public.mosaic_grand_index
     GROUP BY
        "Category",
        "Topic"
     ORDER BY
        MIN(CAST("row.names" AS INT) )
  ),
  catId AS
  (
     SELECT
        "Category",
        MIN(CAST("row.names" AS INT) ) catid
     FROM
        public.mosaic_grand_index
     GROUP BY
        "Category"
     ORDER BY
        MIN(CAST("row.names" AS INT) )
  ),
  groupedIntoTopics AS
  (
     SELECT
        Var."Category",
        topid,
        concat('"', Var."Topic", '"', ':{', string_agg( concat( '"', "VariableName" , '"', ':', "allvarsjson"), ', '
     order by
        Var."VarId") , '}' ) AS jsontopic
     FROM
        AllVarsDesc Var
        LEFT JOIN
           ConcatGroups Grp
           ON Var."VarId" = Grp."VarId"
        LEFT JOIN
           topicId tid
           ON Var."Category" = tid."Category"
           AND Var."Topic" = tid."Topic"
     GROUP BY
        Var."Category",
        Var."Topic",
        tid.topid
     ORDER BY
        tid.topid
  ),
  groupedIntoCats as
  (
     SELECT
        concat('"', gtp."Category" , '":{',
           string_agg(concat('', "jsontopic", ''), ', '
               order by topid)
         , '}') cats
     FROM
        groupedIntoTopics gtp
        LEFT JOIN
           catId cat
           ON gtp."Category" = cat."Category"
     GROUP BY
        gtp."Category",
        catid
     ORDER BY
        catid
  )
  SELECT
     concat('{', string_agg(cats, ', '), '}')::json
  FROM
     groupedIntoCats`;
  pool.query(geoquery, callback);
};
