// const db = require("./db");

async function save(report) {
  const { email, levelsender, loggers } = report;
  const ls = levelsender;
  const ll = loggers.find((l) => l.type.includes("Levelogger"));
  if (!ll)
    throw new Error("No Levelogger at " + report.levelsender.serial + "?");
  const pl = loggers.find((l) => l.type.includes("Barologger"));
  if (!pl)
    throw new Error("No Barologger at " + report.levelsender.serial + "?");
  const obj = {
    num: { dollar: email.num },
    sent: { dollar: email.sent },
    level_logger: { dollar: ll.serial },
    pressure_logger: { dollar: pl.serial },
    battery: { dollar: ls.battery },
    sample_rate: { dollar: ls.sampleRate },
    report_rate: { dollar: ls.reportRate },
    state: { dollar: ls.state },
    start_report: { query: `'${ls.startReport}'::TIMESTAMP WITH TIME ZONE` },
    ll_type: { dollar: ll.type },
    ll_model: { dollar: ll.model },
    ll_v: { dollar: ll.v },
    ll_battery: { dollar: ll.battery },
    ll_n_logs: { dollar: ll.logs },
    ll_max_logs: { dollar: 40000 },
    ll_rate: { dollar: ll.logRate },
    ll_mem: { dollar: ll.memoryMode },
    ll_log_type: { dollar: ll.logType },
    ll_state: { dollar: ll.type },
    ll_start_logger: { query: `'${ll.startLogger}'::TIMESTAMP WITH TIME ZONE` },
    pl_type: { dollar: pl.type },
    pl_model: { dollar: pl.model },
    pl_v: { dollar: pl.v },
    pl_battery: { dollar: pl.battery },
    pl_n_logs: { dollar: pl.logs },
    pl_max_logs: { dollar: 40000 },
    pl_rate: { dollar: pl.logRate },
    pl_mem: { dollar: pl.memoryMode },
    pl_log_type: { dollar: pl.memoryMode },
    pl_state: { dollar: pl.state },
    pl_start_logger: { query: `'${pl.startLogger}'::TIMESTAMP WITH TIME ZONE` },
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
    if (v.dollar) {
      values.push("$" + i);
      array.push(v.dollar);
      ++i;
    } else {
      values.push(v.query);
    }
  }
  fields = fields.join(", ");
  values = values.join(", ");
  console.log("fields");
  console.log(fields);
  console.log("values");
  console.log(values);
  console.log("array");
  console.log(array);
  const query =
    "INSERT INTO emails (num, sent, level_logger, pressure_logger, battery, body, sample_rate," +
    "report_rate, state, start_report, ll_type, ll_model, ll_v, ll_battery, ll_n_logs, ll_max_logs," +
    "ll_rate, ll_mem, ll_log_type, ll_state, ll_start_logger, pl_type, pl_model, pl_v, pl_battery, pl_n_logs, pl_max_logs," +
    "pl_rate, pl_mem, pl_log_type, pl_state, pl_start_logger, station) VALUES ($1, $2, $3, $4)";
  // await db.query(query, [
  //   email.num,
  //   email.sent,
  //   ll.serial,
  //   pl.serial,
  //   ls.battery,
  //   email.body,
  //   ls.sampleRate,
  //   ls.reportRate,
  //   ls.state,
  // ]);
}

module.exports = save;
