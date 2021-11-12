const debug = require("debug")("timakan:readEmails");

const db = require("./src/db");
const Harpy = require("./src/Harpy");
const imaper = require("./src/imaper");
const { save } = require("./src/saver");
const { send } = require("./src/ftper");

async function readEmails() {
  try {
    const reports = await imaper();
    for (const report of reports) {
      await save(report);
      await send(report);
    }
  } catch (e) {
    throw e;
  } finally {
    await db.end();
  }
}

readEmails().catch((e) => Harpy.notify(e));
