const debug = require("debug")("timakan:rereader");
const db = require("./db");
const parse = require("./parser");
const { correct } = require("./corrector");

async function empty() {
  await db.query("DELETE FROM corrected", []);
  await db.query("DELETE FROM corrected_rejected", []);
}

const levelQuery = `INSERT INTO corrected (moment, level, l_temp, email, station) VALUES 
('${obs.timestamp}'::TIMESTAMP WITH TIME ZONE, $1, $2, $3, (SELECT station FROM water_stations_levelsender WHERE levelsender=$4))
ON CONFLICT (station, moment) DO UPDATE
SET level=EXCLUDED.level, l_temp=EXCLUDED.l_temp`;
const pressureQuery = `INSERT INTO corrected (moment, pressure, p_temp, email, station) VALUES 
('${obs.timestamp}'::TIMESTAMP WITH TIME ZONE, $1, $2, $3, (SELECT station FROM water_stations_levelsender WHERE levelsender=$4))
ON CONFLICT (station, moment) DO UPDATE
SET pressure=EXCLUDED.pressure, p_temp=EXCLUDED.p_temp`;

async function reread() {
  const query = "SELECT * FROM emails ORDER BY id";
  const rows = await db.query(query, []);
  for (const row of rows) {
    const body = row.body;
    let report = parse(body);
    report = correct(report);

    const ld = report.levelData;
    for (const obs of ld.data) {
      await db.query(levelQuery, [
        obs.other,
        obs.temp,
        row.id,
        report.levelsender.serial,
      ]);
    }

    const pd = report.baroData;
    for (const obs of pd.data) {
      await db.query(pressureQuery, [
        obs.other,
        obs.temp,
        row.id,
        report.levelsender.serial,
      ]);
    }
  }
}

module.exports = { empty, reread };
