// @ts-check

// SETUP
// =============================================================================
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const app = express();
const morgan = require("morgan");
const winston = require("winston");
const CloudWatchTransport = require("winston-aws-cloudwatch");
const jwt = require("jsonwebtoken");

// SWAGGER SETUP
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDefinition = {
  basePath: "/",
  securityDefinitions: {
    JWT: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
};
const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"],
};
// @ts-ignore
const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ERROR LOGGER SETUP
morgan.token("token", function (req) {
  if (req.headers.authorization) {
    return JSON.stringify(jwt.decode(req.headers.authorization.replace("JWT ", "")));
  } else {
    return "{}";
  }
});
const apiname = process.env.API_NAME || "API";
const addAppNameFormat = winston.format((info) => {
  info.appName = apiname;
  return info;
});
const parseMessage = function (message) {
  const variables = message.split("|");
  const token = JSON.parse(variables[6]);
  let username = "";
  if (token && token.username) username = token.username;
  let organisation = "";
  if (token && token.organisation) organisation = token.organisation;
  return {
    method: variables[0],
    url: variables[1],
    status: variables[2],
    response: variables[3],
    responsetime: variables[4],
    date: variables[5],
    token: {
      username: username,
      organisation: organisation,
    },
  };
};
const AWSSettings = require("./config/database").settings;
const awstransport = new CloudWatchTransport({
  logGroupName: "api-calls",
  logStreamName: apiname,
  createLogGroup: false,
  createLogStream: true,
  submissionInterval: 2000,
  submissionRetryCount: 1,
  batchSize: 1,
  awsConfig: {
    accessKeyId: AWSSettings.accessKeyId,
    secretAccessKey: AWSSettings.secretAccessKey,
    region: AWSSettings.awsregion,
  },
  formatLog: (item) => `${item.level}: ${item.message} ${JSON.stringify(item.meta)}`,
});
// @ts-ignore
const logger = new winston.createLogger({
    transports: [awstransport],
    format: winston.format.combine(addAppNameFormat(), winston.format.json()),
    // @ts-ignore
    dynamicMeta: function (req, res, err) {
      return req.header;
    },
    meta: true,
    expressFormat: true,
    colorize: false,
  }),
  loggerstream = {
    write: function (message, encoding) {
      logger.info(message.replace(/\n$/, ""), {
        metaData: parseMessage(message.replace(/\n$/, "")),
      });
    },
  };
app.use(
  morgan(":method|:url|:status|:res[content-length]|:response-time|:date[iso]|:token", {
    stream: loggerstream,
  })
);

// SETTINGS FOR OUR API
// =============================================================================
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
const mfa = require("./routes/mfa");
app.use("/mfa", mfa);
const otp = require("./routes/otp_codes");
app.use("/otp", otp);
const password = require("./routes/password");
app.use("/password", password);
const requests = require("./routes/requests");
app.use("/requests", requests);
const serviceaccounts = require("./routes/service");
app.use("/serviceaccounts", serviceaccounts);
const teamroles = require("./routes/teamroles");
app.use("/teamroles", teamroles);
const userroles = require("./routes/userroles");
app.use("/userroles", userroles);
const users = require("./routes/users");
app.use("/users", users);
const postcodes = require("./routes/postcodes");
app.use("/postcodes", postcodes);
const pcninformation = require("./routes/pcninformation");
app.use("/pcninformation", pcninformation);
const demographics = require("./routes/demographics");
app.use("/demographics", demographics);
const patientlists = require("./routes/patientlists");
app.use("/patientlists", patientlists);
const shielding = require("./routes/shielding");
app.use("/shielding", shielding);

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

app.get("/", (req, res) => {
  res.send("Invalid endpoint");
});

// EXPORT APP
// =============================================================================
module.exports = app;
