// @ts-check
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
const credentials = require("../_credentials/credentials");

module.exports = function (passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = credentials.secret;
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.getUserByUsername(jwt_payload.username, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, jwt_payload);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
