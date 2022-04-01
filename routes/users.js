// @ts-check

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Authenticate = require("../models/authenticate");
const passport = require("passport");
const credentials = require("../_credentials/credentials");
const JWT = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and login
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     description: Registers a User
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: name
 *         description: User's name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: User's email.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: User's unique name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisation
 *         description: User's Organisation.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: linemanager
 *         description: Line Manager's Email.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: key
 *         description: Key for encryption
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation of Account Registration
 */
router.post("/register", (req, res, next) => {
  let newUser = {
    name: { S: req.body.name },
    email: { S: req.body.email },
    username: { S: req.body.username },
    password: { S: req.body.password },
    organisation: { S: req.body.organisation },
    linemanager: { S: req.body.linemanager },
  };
  if (req.body.key === credentials.secretkey) {
    User.addUser(newUser, req.body.password, (err, user) => {
      if (err) {
        res.json({
          success: false,
          msg: "Failed to register user",
        });
      } else {
        res.json({
          success: true,
          msg: "User registered",
        });
      }
    });
  } else {
    res.json({
      success: false,
      msg: "Unauthorized",
    });
  }
});

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     description: Authenticates a User
 *     tags:
 *      - Login
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: username
 *         description: User's unique name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: organisation
 *         description: User's Organisation.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authentication
 *         description: User's Organisation Auth Method
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User Token
 */
router.post("/authenticate", (req, res, next) => {
  //Get query parameters
  const username = req.body.username;
  const password = req.body.password;
  const organisation = req.body.organisation;
  const authentication = req.body.authentication;

  //Get authentication method
  let getAuthenticationMethod = (fn) => {
    //Authenticate with email?
    if (username.includes("@")) {
      Authenticate.loginEmail(authentication, username, password, organisation, (err, response) => {
        fn(err, response);
      });
    } else {
      Authenticate.loginUsername(authentication, username, password, organisation, (err, response) => {
        fn(err, response);
      });
    }
  };

  //Get JWT
  getAuthenticationMethod((err, response) => {
    if (err) {
      res.status(401).json({ success: false, msg: err });
      return null;
    } else {
      //Decode token
      const tokenDecoded = JWT.decode(response);

      //Upgrade token
      Authenticate.upgradePassportwithOrganisation(tokenDecoded, false, (err, token) => {
        if (err) console.log(err);

        //Check password expiry
        // @ts-ignore
        User.getUserByUsername(tokenDecoded.username, (err, data) => {
          let password_expired = true;
          let user = data.Items[0];

          //Check authentication method
          if (authentication == "Demo") {
            //Check password expiry
            if (user.password_expires) {
              //Date in future?
              if (new Date(user.password_expires).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {
                password_expired = false;
              }
            }
          } else {
            //Default to false
            password_expired = false;
          }

          //Return token
          return res.json({ success: true, token: token, password_expired: password_expired });
        });
      });
    }
  });
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Returns User Profile
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: User Profile
 */
router.get(
  "/profile",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.json({
      user: req.user,
    });
  }
);

/**
 * @swagger
 * /users/validate:
 *   get:
 *     security:
 *      - JWT: []
 *     description: Checks User Credentials
 *     tags:
 *      - Validation
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Credentials valid
 *       401:
 *         description: Credentials invalid
 */
router.get(
  "/validate",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    res.status(200).json({
      msg: "Credentials valid",
    });
  }
);

module.exports = router;
