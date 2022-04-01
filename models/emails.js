// @ts-check

const credentials = require("../_credentials/credentials");
const template = require("../config/html");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  // @ts-ignore
  host: credentials.EmailHost,
  port: credentials.EmailPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: credentials.emailusername,
    pass: credentials.emailpassword,
  },
});
const htmlOutput = function (message) {
  return template.replace("MESSAGE", message);
};

const htmlOutputActions = function (actions, message) {
  const actionhtml = createActions(actions);
  let html = template.replace("MESSAGE</div>", 'MESSAGE</div><div class="full main mat-card action">ACTIONS</div>');
  return html.replace("ACTIONS", actionhtml);
};

const createActions = function (actions) {
  let result = "";
  actions.forEach((action) => {
    result += '<a href="' + action.url + '" target="_blank" class="mat-button ' + action.class + '">' + action.text + "</a>";
  });
  return result;
};

module.exports.sendMail = async function (message, subject, recipients, callback) {
  let info = transporter
    .sendMail({
      to: recipients,
      subject: subject,
      text: message,
      html: htmlOutput(message),
    })
    .then((value) => {
      console.log("Message sent: " + value.messageId + ", to: " + recipients);
      callback(null, "Message sent");
    });
};

module.exports.sendMailWithActions = async function (action, message, subject, recipients, callback) {
  let info = transporter
    .sendMail({
      to: recipients,
      subject: subject,
      text: message,
      html: htmlOutputActions(action, message),
    })
    .then((value) => {
      console.log("Message sent: " + value.messageId + ", to: " + recipients);
      callback(null, "Message sent");
    });
};

module.exports.generateActions = function (actions) {
  const output = [];
  actions.forEach((action) => {
    action = action.replace("}", "");
    let notes = action.split(",");
    notes = notes.filter((x) => x.length > 0);
    if (notes.length > 0) {
      const classtype = notes[0].split(":")[1].replace('"', "").replace('"', "").trim();
      const texttype = notes[1].split(":")[1].replace('"', "").replace('"', "").trim();
      const actiontype = notes[2].split(":")[1].replace('"', "").replace('"', "").trim();
      output.push({
        class: classtype,
        text: texttype,
        url: actiontype,
      });
    }
  });
  return output;
};

module.exports.emailActions = function (email, message, header, actions, callback) {
  const actionArray = email.generateActions(actions);
  email.sendMailWithActions(actionArray, message, header, email, callback);
};
