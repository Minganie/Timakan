const fs = require("fs");
const stringify = require("csv-stringify");

const db = require("./db");
const { csvPath } = require("config");

async function writeCsv(data, file) {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      if (err) return reject(err);
      fs.writeFile(file, output, {}, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  });
}

async function updateOne(gid) {
  try {
    let rows = await db.query(
      "SELECT moment, corrected FROM public.timakan_historic WHERE station=$1 ORDER BY moment",
      [gid]
    );
    await writeCsv(rows, csvPath + gid + "_all.csv");
    rows = await db.query(
      "SELECT moment, q0, q10, q50, q90, q100, corrected FROM timakan_week where station=$1 ORDER BY moment",
      [gid]
    );
    await writeCsv(rows, csvPath + gid + "_week.csv");
    rows = await db.query(
      "SELECT moment, q0, q10, q50, q90, q100, corrected FROM timakan_year WHERE station=$1 ORDER BY moment",
      [gid]
    );
    await writeCsv(rows, csvPath + gid + "_year.csv");
  } catch (e) {
    throw e;
  }
}

async function update() {
  try {
    const stations = await db.query("SELECT gid FROM water_stations", []);
    for (const station of stations) {
      await updateOne(station.gid);
    }
  } catch (e) {
    throw e;
  }
}

module.exports = { update, updateOne, writeCsv };
