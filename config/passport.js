// @ts-check
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const credentials = require("../_credentials/credentials");

module.exports = function (passport) {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = credentials.secret;
    passport.use(
        new JwtStrategy(opts, (jwtPayload, done) => {
            if (jwtPayload.expiry < Date.now()) {
                return done(null, false);
            }
            return done(null, jwtPayload);
        })
    );
};
