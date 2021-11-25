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
      imap.openBox("INBOX", false, function (err, box) {
        if (err) return reject(err);
        if (box.messages.total > 0) {
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
                if (
                  process.env.NODE_ENV === "production" &&
                  buffer.includes("LS Report")
                )
                  imap.seq.addFlags(seqno, "\\Deleted", (err) => reject(err));
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
            Harpy.notify(err);
            reject(err);
          });
          f.once("end", function () {
            debug("Done fetching all messages!");
            imap.closeBox(true, (err) => reject(err));
            imap.end();
            resolve(messages);
          });
        } else {
          imap.closeBox(true, (err) => reject(err));
          imap.end();
          resolve([]);
        }
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

const imaper = async () => {
  let msg;
  try {
    const raws = await raw();
    const reports = [];
    for (const raw of raws) {
      msg = raw;
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
          const e = new Error("Couldn't find the date from headers");
          e.emailRaw = msg;
          e.emailHeaders = message.headers;
          throw e;
        }
      }
    }
    return reports;
  } catch (e) {
    e.emailRaw = msg;
    throw e;
  }
};

module.exports = imaper;
