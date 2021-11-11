const debug = require("debug")("timakan:readEmails");

const db = require("./src/db");
const { empty, reread } = require("./src/rereader");
const Harpy = require("./src/Harpy");
const imaper = require("./src/imaper");
const parse = require("./src/parser");
const save = require("./src/saver");

async function readEmails() {
  // const report = parse(txt);
  // report.email = {
  //   num: 1,
  //   sent: "2018-12-21T12:30:00-04",
  // };
  // await save(report);

  await db.end();
}

readEmails().catch((e) => Harpy.notify(e));
