const reread = require("./src/rereader");
const db = require("./src/db");
const { update } = require("./src/csvUpdater");
const Harpy = require("./src/Harpy");

async function main() {
  try {
    //TODO reset the sequences and empty the tables as postgres first
    /*
    ALTER SEQUENCE corrected_id_seq RESTART WITH 1;
    ALTER SEQUENCE corrected_rejected_id_seq RESTART WITH 1;
	  DELETE FROM corrected;
	  DELETE FROM corrected_rejected;
    */
    await reread();

    await update();
  } catch (e) {
    throw e;
  } finally {
    await db.end();
  }
}

main().catch((e) => Harpy.notify(e));
