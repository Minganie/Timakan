const db = require("./src/db");
const Harpy = require("./src/Harpy");
const { update } = require("./src/csvUpdater");

async function updateCsv() {
  try {
    await update();
  } catch (e) {
    throw e;
  } finally {
    await db.end();
  }
}

updateCsv().catch((e) => Harpy.notify(e));
