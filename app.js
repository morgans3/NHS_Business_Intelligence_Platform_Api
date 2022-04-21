// SETUP
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
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerdocs = swaggerJSDoc({
  swaggerDefinition: {
    basePath: "/",
    securityDefinitions: {
      JWT: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  },
  apis: ["./routes/*.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerdocs));

// ERROR LOGGER SETUP
app.use(APILogging(apiname, AWSSettings));

// SETTINGS FOR OUR API
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// ROUTES FOR OUR API
const routes = ["mfa", "otp", "password", "requests", "serviceaccounts", "confluence", "docobooutbound", "docobo", "users", "postcodes", "pcninformation", "demographics", "patientlists", "shielding", "userprofiles", "teamprofiles", "teamrequests", "teammembers", "searchusers", "searchs", "capabilities", "roles", "virtualward", "teams", "niceevidence", "gpinpatients", "lpresviewer", "opensource", "trials", "wards", "grandindex", "orgboundaries", "isochrone", "gppractices", "outbreak"];

//ADD ENDPOINTS
app.use("/", require("./routes/generic"));
app.use("/", require("./routes/access-logs"));
app.get("/", (req, res) => {
  res.send("Invalid endpoint");
});
routes.forEach((route) => {
  app.use("/" + route, require("./routes/" + route));
});

//ADD JWT AUTH
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// EXPORT APP
module.exports = app;
