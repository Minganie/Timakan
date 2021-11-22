const debug = require("debug")("timakan:readEmails");

const db = require("./src/db");
const Harpy = require("./src/Harpy");
const imaper = require("./src/imaper");
const { save } = require("./src/saver");
const { send } = require("./src/ftper");
const { update } = require("./src/csvUpdater");

async function readEmails() {
  try {
    const reports = await imaper();
    for (const report of reports) {
      await save(report);
      await send(report);
    }
    await update();
  } catch (e) {
    throw e;
  } finally {
    await db.end();
  }
}

readEmails().catch((e) => Harpy.notify(e));
