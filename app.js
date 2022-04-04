// @ts-check

// SETUP
// =============================================================================
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const app = express();
const AWSSettings = require("./config/database").settings;
const apiname = process.env.API_NAME || "API";
const APILogging = require("diu-api-logging").Methods.Logging.APILogging;

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
const logs = APILogging(apiname, AWSSettings);
app.use(logs);

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
app.use("/mfa", require("./routes/mfa"));
app.use("/otp", require("./routes/otp"));
app.use("/password", require("./routes/password"));
app.use("/requests", require("./routes/requests"));
app.use("/serviceaccounts", require("./routes/serviceaccounts"));
app.use("/teamroles", require("./routes/teamroles"));
app.use("/userroles", require("./routes/userroles"));
app.use("/users", require("./routes/users"));
app.use("/postcodes", require("./routes/postcodes"));
app.use("/pcninformation", require("./routes/pcninformation"));
app.use("/demographics", require("./routes/demographics"));
app.use("/patientlists", require("./routes/patientlists"));
app.use("/shielding", require("./routes/shielding"));
app.use("/userprofiles", require("./routes/userprofiles"));
app.use("/teamprofiles", require("./routes/teamprofiles"));
app.use("/teammembers", require("./routes/teammembers"));
app.use("/teamrequests", require("./routes/teamrequests"));
app.use("/searchusers", require("./routes/searchusers"));
app.use("/searchs", require("./routes/searchs"));

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

app.get("/", (req, res) => {
  res.send("Invalid endpoint");
});

// EXPORT APP
// =============================================================================
module.exports = app;
