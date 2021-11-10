const db = require("./db");

async function findOffset(date) {
  const rows = await db.query(
    `SELECT to_char('${date + "-05"}'::TIMESTAMP WITH TIME ZONE, 'OF') as code`,
    []
  );
  return rows[0].code;
}

async function appendOffsetToTimestamps(report) {
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
}

module.exports = { findOffset, appendOffsetToTimestamps };
