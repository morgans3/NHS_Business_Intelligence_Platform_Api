(async () => {
    try {
        const AWSHelper = require("diu-data-functions").Helpers.Aws;
        const AwsCredentials = JSON.parse(await AWSHelper.getSecrets("awsdev"));
        process.env.AWS_SECRETID = AwsCredentials.secretid;
        process.env.AWS_SECRETKEY = AwsCredentials.secretkey;
        const PostgresCredentials = JSON.parse(await AWSHelper.getSecrets("postgres"));
        process.env.POSTGRES_UN = PostgresCredentials.username;
        process.env.POSTGRES_PW = PostgresCredentials.password;
    } catch (error) {
        console.error(error);
    }
})().then(() => {
    //Get models
    const DIULibrary = require("diu-data-functions");
    const AccessLogModel = new DIULibrary.Models.AccessLog();
    const AccessLogStatisticModel = new DIULibrary.Models.AccessLogStatistic();

    //Get all logs by date
    const getLogs = async () => {
        let logs = [];
        let pageKey = "start";
        while (pageKey !== null) {
            //Get data
            let filters = { date: new Date().toISOString().slice(0, 10) };
            let data = await (new Promise((resolve) => {
                //Add page key?
                if (pageKey !== 'start') {
                    filters.pageKey = JSON.stringify(pageKey);
                }

                //Get data
                AccessLogModel.getByDate(filters, (err, data) => {
                    //Log error
                    if (err) { console.log(err); process.exit(); }

                    //Gather data
                    pageKey = data.LastEvaluatedKey || null;
                    resolve(data.Items);
                });
            }));

            //Append
            logs = logs.concat(data);
        }

        return logs;
    };

    //Get logs and handle
    getLogs().then((logs) => {
        let statistics = [];

        //Add date total
        statistics.push({
            "type": "Total",
            "date": logs[0].date,
            "total": logs.length
        });

        //Add stat per type
        let types = [...new Set(logs.map(item => item.type))];
        types.forEach((type) => {
            statistics.push({
                "type": type,
                "date": logs[0].date,
                "total": logs.filter(log => log.type == type).length
            });
        });

        //Persist in database
        if (statistics.length > 0) {
            AccessLogStatisticModel.create(statistics, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Statistics logged to the database!");
                }
                process.exit();
            });
        }
    });
});