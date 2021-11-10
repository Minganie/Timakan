const parse = require("./src/parser");
const save = require("./src/saver");
const imaper = require("./src/imaper");
const { empty, reread } = require("./src/rereader");
const db = require("./src/db");
const debug = require("debug")("timakan:readEmails");

async function readEmails() {
  // const report = parse(txt);
  // report.email = {
  //   num: 1,
  //   sent: "2018-12-21T12:30:00-04",
  // };
  // await save(report);

  await db.end();
}

readEmails().catch((e) => console.error(e));
