// const db = require("./db");

const db = require("./db");

async function insertEmail(report) {
  try {
    const { email, levelsender, levelogger, barologger } = report;
    const ls = levelsender;
    const ll = levelogger;
    const pl = barologger;
    const obj = {
      num: { dollar: email.num },
      sent: { query: `'${email.receivedOn}'::TIMESTAMP WITH TIME ZONE` },
      level_logger: { dollar: ll.serial },
      pressure_logger: { dollar: pl.serial },
      battery: { dollar: ls.battery },
      body: { dollar: email.text },
      sample_rate: { dollar: ls.sampleRate },
      report_rate: { dollar: ls.reportRate },
      signal_strength: {
        query: ls.signalStrength ? String(ls.signalStrength) : "NULL",
      },
      state: { dollar: ls.state },
      start_report: { query: `'${ls.startReport}'::TIMESTAMP WITH TIME ZONE` },
      ll_type: { dollar: ll.type },
      ll_model: { dollar: ll.model },
      ll_v: { dollar: ll.v },
      ll_battery: { dollar: ll.battery },
      ll_n_logs: { dollar: ll.logs },
      ll_max_logs: { dollar: ll.totalLogs },
      ll_rate: { dollar: ll.logRate },
      ll_mem: { dollar: ll.memoryMode },
      ll_log_type: { dollar: ll.logType },
      ll_state: { dollar: ll.state },
      ll_start_logger: {
        query: `'${ll.startLogger}'::TIMESTAMP WITH TIME ZONE`,
      },
      pl_type: { dollar: pl.type },
      pl_model: { dollar: pl.model },
      pl_v: { dollar: pl.v },
      pl_battery: { dollar: pl.battery },
      pl_n_logs: { dollar: pl.logs },
      pl_max_logs: { dollar: pl.totalLogs },
      pl_rate: { dollar: pl.logRate },
      pl_mem: { dollar: pl.memoryMode },
      pl_log_type: { dollar: pl.logType },
      pl_state: { dollar: pl.state },
      pl_start_logger: {
        query: `'${pl.startLogger}'::TIMESTAMP WITH TIME ZONE`,
      },
      station: {
        query: `(SELECT station FROM water_stations_levelsender WHERE levelsender=${ls.serial})`,
      },
    };
    let fields = [];
    let values = [];
    let array = [];
    let i = 1;
    for (const [k, v] of Object.entries(obj)) {
      fields.push(k);
      if (v.hasOwnProperty("dollar")) {
        values.push("$" + i);
        array.push(v.dollar);
        ++i;
      } else {
        values.push(v.query);
      }
    }
    fields = fields.join(", ");
    values = values.join(", ");
    const query = `INSERT INTO emails (${fields}) VALUES (${values}) RETURNING id`;
    const rows = await db.query(query, array);
    return rows[0].id;
  } catch (e) {
    e.report = report;
    throw e;
  }
}

function levelQuery(obs) {
  return `INSERT INTO corrected (moment, level, l_temp, email, station) VALUES 
('${obs.timestamp}'::TIMESTAMP WITH TIME ZONE, $1, $2, $3, (SELECT station FROM water_stations_levelsender WHERE levelsender=$4))
ON CONFLICT (station, moment) DO UPDATE
SET level=EXCLUDED.level, l_temp=EXCLUDED.l_temp`;
}
function pressureQuery(obs) {
  return `INSERT INTO corrected (moment, pressure, p_temp, email, station) VALUES 
('${obs.timestamp}'::TIMESTAMP WITH TIME ZONE, $1, $2, $3, (SELECT station FROM water_stations_levelsender WHERE levelsender=$4))
ON CONFLICT (station, moment) DO UPDATE
SET pressure=EXCLUDED.pressure, p_temp=EXCLUDED.p_temp`;
}

async function insertData(emailId, report) {
  try {
    const ld = report.levelData;
    for (const obs of ld.data) {
      await db.query(levelQuery(obs), [
        obs.other,
        obs.temp,
        emailId,
        report.levelsender.serial,
      ]);
    }

    const pd = report.baroData;
    for (const obs of pd.data) {
      await db.query(pressureQuery(obs), [
        obs.other,
        obs.temp,
        emailId,
        report.levelsender.serial,
      ]);
    }
  } catch (e) {
    e.report = report;
    throw e;
  }
}

async function save(report) {
  try {
    const id = await insertEmail(report);
    await insertData(id, report);
  } catch (e) {
    throw e;
  }
}

module.exports = { insertEmail, insertData, save };
