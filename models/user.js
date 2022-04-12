// @ts-check
const DynamoDB = require("diu-data-functions").Methods.DynamoDBData;
const bcrypt = require("bcryptjs");
const AWS = require("../config/database").AWS;
const tableName = "users";

module.exports.getUserByUsername = function (username, callback) {
  DynamoDB.getItemByKey(AWS, tableName, "username", username, callback);
};

module.exports.getUserByPartialUsername = function (username, callback) {
  DynamoDB.getItemByIndex(AWS, tableName, "username", username, callback);
};

module.exports.getUserByEmail = function (email, callback) {
  DynamoDB.getItemByIndex(AWS, tableName, "email", email, callback);
};

module.exports.addUser = function (newUser, password, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      newUser["password"] = { S: hash };
      DynamoDB.addItem(AWS, tableName, newUser, callback);
    });
  });
};

module.exports.updateUser = function (username, newpassword, callback) {
  this.getUserByUsername(username, (err, res) => {
    //Set user
    const user = res.Items[0];

    //Generate password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newpassword, salt, (err, hash) => {
        if (err) throw err;
        const docClient = new AWS.DynamoDB.DocumentClient();

        //Generate password expiry
        let passwordExpires = new Date();
        passwordExpires.setDate(passwordExpires.getDate() + 150);

        //Update password & expiry
        var params = {
          TableName: "users",
          Key: {
            username: user.username,
            organisation: user.organisation,
          },
          UpdateExpression: "set #password = :password, #password_expires = :password_expires",
          ExpressionAttributeNames: {
            "#password": "password",
            "#password_expires": "password_expires",
          },
          ExpressionAttributeValues: {
            ":password": hash,
            ":password_expires": passwordExpires.toISOString(),
          },
          ReturnValues: "UPDATED_NEW",
        };

        // @ts-ignore
        docClient.update(params, (updateErr, updateRes) => {
          callback(updateErr, res.Items[0]);
        });
      });
    });
  });
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};
