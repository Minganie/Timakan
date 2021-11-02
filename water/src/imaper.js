const Imap = require("imap"),
  inspect = require("util").inspect;
const debug = require("debug")("timakan:imaper");
const { email } = require("config");
const { simpleParser } = require("mailparser");

const { getDateFromHeaders } = require("./util");

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
        if (err) throw err;
        const f = imap.seq.fetch("*", {
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
              debug("streamed one");
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
        });
        f.once("end", function () {
          debug("Done fetching all messages!");
          imap.end();
          resolve(messages);
        });
      });
    });

    imap.once("error", function (err) {
      console.error(err);
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
    const parsed = [];
    for (const raw of raws) {
      const pars = await simpleParser(raw);
      if (pars.subject.includes("LS Report")) {
        const date = getDateFromHeaders(pars);
        if (date) {
          pars.receivedOn = date;
          parsed.push(pars);
        } else {
          throw new Error(
            "Couldn't find the date from these headers: " +
              stringifyHeaders(pars.headers)
          );
        }
      }
    }
    return parsed;
  } catch (e) {
    throw e;
  }
};

module.exports = imaper;
