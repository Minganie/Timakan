const { empty, reread } = require("./src/rereader");
const db = require("./src/db");
const { update } = require("./src/csvUpdater");

async function main() {
  //TODO reset the sequence as postgres first
  /*
  ALTER SEQUENCE corrected_id_seq RESTART WITH 1;
  ALTER SEQUENCE corrected_rejected_id_seq RESTART WITH 1;
  */
  await empty();
  await reread();

  await update();

  await db.end();
}

main().catch((e) => console.error(e));
