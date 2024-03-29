const db = require("./db");

async function findOffset(date) {
  try {
    const rows = await db.query(
      `SELECT to_char('${
        date + "-05"
      }'::TIMESTAMP WITH TIME ZONE, 'OF') as code`,
      []
    );
    return rows[0].code;
  } catch (e) {
    throw e;
  }
}

async function appendOffsetToTimestamps(report) {
  try {
    const { levelsender, levelogger, barologger, levelData, baroData } = report;
    const offset = await findOffset(levelsender.dateBag.string);
    levelsender.startReport = levelsender.startReport + offset;
    levelogger.startLogger = levelogger.startLogger + offset;
    barologger.startLogger = barologger.startLogger + offset;
    for (const line of levelData.data) {
      line.timestamp = line.timestamp + offset;
    }
    for (const line of baroData.data) {
      line.timestamp = line.timestamp + offset;
    }
    return report;
  } catch (e) {
    throw e;
  }
}

module.exports = { findOffset, appendOffsetToTimestamps };
