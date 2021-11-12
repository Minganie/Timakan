const { makeHmJson, send } = require("../src/ftper");
const imaper = require("../src/imaper");
const { save } = require("../src/saver");

async function removeFromDb(station, ts, db) {
  const rows = await db.query(
    `SELECT id FROM emails WHERE station=$1 AND sent='${ts}'::TIMESTAMP WITH TIME ZONE`,
    [station]
  );
  const id = rows && rows[0] && rows[0].id;
  if (id) {
    await db.query("DELETE FROM corrected WHERE email=$1", [id]);
    await db.query("DELETE FROM emails WHERE id=$1", [id]);
  }
}

describe("ftper", () => {
  let db, report;
  const station = 8;
  const ts = "2021-11-11T18:16:08+0000";
  beforeAll(async () => {
    db = require("../src/db");
    const reports = await imaper();
    report = reports.find(
      (r) =>
        r.email.subject === "284274 LS Report 23" && r.email.receivedOn === ts
    );
    if (!report) throw new Error("No LS Report 23 in scribe mailbox");
    await removeFromDb(station, ts, db);
    await save(report);
  });
  afterAll(async () => {
    await removeFromDb(station, ts, db);
    await db.end();
  });
  it("makes the proper json", () => {
    const json = makeHmJson(report);
    expect(json.head).toBeTruthy();
    expect(json.data).toBeTruthy();
    expect(json.data.length).toBe(2);
    const [one, two] = json.data;
    expect(one.time).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(one.vals).toBeTruthy();
    expect(one.vals.length).toBe(4);
    const batt = 9.16023 + 70 * 0.0284091;
    const ptemp = 19.186;
    const corr = 10.5611 - 102.467 * 0.101972;
    const ltemp = 18.2042;
    expect(one.vals).toEqual([batt, ptemp, corr, ltemp]);
  });
  it("can send a file", async () => {
    try {
      const res = await send(report);
      expect(res).toBe(true);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
});
