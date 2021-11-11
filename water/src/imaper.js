const Imap = require("imap"),
  inspect = require("util").inspect;
const debug = require("debug")("timakan:imaper");
const { email } = require("config");
const { simpleParser } = require("mailparser");

const { getDateFromHeaders } = require("./util");
const parse = require("./parser");
const { appendOffsetToTimestamps } = require("./appendOffsetToTimestamps");
const Harpy = require("./Harpy");

const raw = () => {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email.user,
      password: email.password,
      host: "hydrometeocharlevoix.com",
      port: 993,
      tls: true,
    });

    imap.once("ready", function () {
      imap.openBox("INBOX", true, function (err, box) {
        if (err) return reject(err);
        const f = imap.seq.fetch("1:*", {
          bodies: "",
          struct: true,
        });
        const messages = [];
        f.on("message", function (msg, seqno) {
          debug("Message #" + seqno);
          const prefix = "(#" + seqno + ") ";
          msg.on("body", function (stream, info) {
            let buffer = "";
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });
            stream.once("end", function () {
              messages.push(buffer);
              debug("streamed", prefix);
            });
          });
          msg.once("attributes", function (attrs) {
            debug("gotten attributes");
            // debug(prefix + "Attributes: %s" + inspect(attrs, false, 8));
          });
          msg.once("end", function () {
            debug(prefix + "Finished");
          });
        });
        f.once("error", function (err) {
          console.error("Fetch error: " + err);
          reject(err);
        });
        f.once("end", function () {
          debug("Done fetching all messages!");
          imap.end();
          resolve(messages);
        });
      });
    });

    imap.once("error", function (err) {
      Harpy.notify(err);
      reject(err);
    });

    imap.once("end", function () {
      debug("Connection ended");
    });

    imap.connect();
  });
};

function stringifyHeaders(headers) {
  const json = {};
  headers.forEach((v, k) => {
    json[k] = v;
  });
  return JSON.stringify(json);
}

const imaper = async () => {
  try {
    const raws = await raw();
    const reports = [];
    for (const raw of raws) {
      const message = await simpleParser(raw);
      if (message.subject.includes("LS Report")) {
        const date = getDateFromHeaders(message);
        if (date) {
          message.receivedOn = date;
          const [_, num] = message.subject.match(/\d+ LS Report (\d+)/);
          message.num = Number(num);
          let report = parse(message.text);
          report = await appendOffsetToTimestamps(report);
          report.email = message;
          reports.push(report);
        } else {
          throw new Error(
            "Couldn't find the date from these headers: " +
              stringifyHeaders(message.headers)
          );
        }
      }
    }
    return reports;
  } catch (e) {
    throw e;
  }
};

module.exports = imaper;
