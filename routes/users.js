// @ts-check
const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");

const DIULibrary = require("diu-data-functions");
const UserModel = new DIULibrary.Models.UserModel();
const VerificationCodeModel = new DIULibrary.Models.VerificationCodeModel();
const Authenticate = require("../models/authenticate");
const AuthenticateHelper = require("../helpers/authenticate");
const credentials = require("../_credentials/credentials");
const EmailHelper = DIULibrary.Helpers.Email;

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
    UserModel.addUser(newUser, req.body.password, (err, user) => {
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
 *      - Users
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

  //Get JWT
  AuthenticateHelper.login(authentication, username, password, organisation, (err, user) => {
    console.log(err, user);
    if (err) {
      //Return error
      res.status(401).json({ success: false, msg: err });
      return null;
    } else {
      //Upgrade token
      Authenticate.upgradePassportwithOrganisation(JWT.decode(user.jwt), false, (err, token) => {
        if (err) console.log(err);

        //Check password expiry
        let password_expired = true;

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
 *      - Users
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

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     security:
 *      - JWT: []
 *     description: Delete a Nexus user
 *     tags:
 *      - Users
 *     produces:
 *      - application/json
 *     parameters:
 *      - name: username
 *        description: User's unique name.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: organisation
 *        description: User's Organisation.
 *        in: formData
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Credentials valid
 */
router.delete(
  "/delete",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res, next) => {
    UserModel.delete(
      {
        username: req.body.username,
        organisation: req.body.organisation,
      },
      (err, result) => {
        //Return data
        if (err) {
          res.status(500).json({ success: false, msg: err });
          return;
        }
        res.json({ success: true, msg: "User deleted!" });
      }
    );
  }
);

/**
 * @swagger
 * /users/send-code:
 *   post:
 *     description: Send code to email address
 *     tags:
 *      - Email
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: email
 *         description: Email address for which to  verify
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Verification code sent
 */
router.post("/send-code", (req, res, next) => {
  //Generate token and send email
  const payload = req.body;
  VerificationCodeModel.create(
    {
      organisation: "",
      username: payload.email,
      generated: new Date().toISOString(),
    },
    (saveErr, savedCode) => {
      //Check for errors
      if (saveErr) {
        res.json({ success: false, msg: "Failed: " + saveErr });
        return;
      }

      //Send code to email
      EmailHelper.sendMail(
        {
          to: payload.email,
          subject: "Verification Code for Nexus Intelligence",
          message: "Please enter this code where prompted on screen: " + savedCode.code,
        },
        (err, response) => {
          if (err) {
            console.log(err);
            res.json({ success: false, msg: "Failed: " + err });
          } else {
            res.json({ success: true, msg: "Code has been sent to the provided email address" });
          }
        }
      );
    }
  );
});

/**
 * @swagger
 * /users/verify-code:
 *   post:
 *     description: Verify code sent to an email address
 *     tags:
 *      - Email
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: email
 *         description: Email address for which to  verify
 *         in: formData
 *         required: true
 *         type: string
 *       - name: code
 *         description: Code to use for verifying email
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Verification code is/is not valid
 */
router.post("/verify-code", (req, res, next) => {
  //Token provided?
  const payload = req.body;
  VerificationCodeModel.getCode(payload.code, payload.email, (codeErr, codeRes) => {
    //Return error
    if (codeErr) {
      res.json({ success: false, msg: "Failed: " + codeErr });
      return;
    }

    //Return response
    if (codeRes && codeRes.Items.length > 0) {
      //Dont allow re-use
      //passwordModel.deleteCode(payload.code, payload.email, () => {
      res.json({ success: true, msg: "Code is valid." });
    } else {
      res.json({ success: false, msg: "Code not valid." });
    }
  });
});

module.exports = router;
