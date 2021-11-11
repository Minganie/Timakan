const { empty, reread } = require("./src/rereader");
const db = require("./src/db");
const { update } = require("./src/csvUpdater");
const Harpy = require("./src/Harpy");

async function main() {
  try {
    //TODO reset the sequence as postgres first
    /*
    ALTER SEQUENCE corrected_id_seq RESTART WITH 1;
    ALTER SEQUENCE corrected_rejected_id_seq RESTART WITH 1;
    */
    await empty();
    await reread();

    await update();

    await db.end();
  } catch (e) {
    throw e;
  }
}

main().catch((e) => Harpy.notify(e));
