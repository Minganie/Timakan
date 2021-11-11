const imaper = require("../src/imaper");
const { insertEmail, insertData, save } = require("../src/saver");

describe("saver", () => {
  let db, report;
  const station = 8;
  const ts = "2021-11-11T17:15:52+0000";
  beforeAll(async () => {
    db = require("../src/db");
    const reports = await imaper();
    report = reports.find(
      (r) =>
        r.email.subject === "284274 LS Report 22" &&
        r.email.receivedOn === "2021-11-11T17:15:52+0000"
    );
    if (!report) throw new Error("No LS Report 22 in scribe mailbox");
  });
  afterAll(async () => {
    await db.end();
  });
  afterEach(async () => {
    const rows = await db.query(
      `SELECT id FROM emails WHERE station=$1 AND sent='${ts}'::TIMESTAMP WITH TIME ZONE`,
      [station]
    );
    const id = rows && rows[0] && rows[0].id;
    if (id) {
      await db.query("DELETE FROM corrected WHERE email=$1", [id]);
      await db.query("DELETE FROM emails WHERE id=$1", [id]);
    }
  });
  describe("saves the email", () => {
    it("with a signal strength", async () => {
      await insertEmail(report);
      const rows = await db.query(
        `SELECT * FROM emails WHERE station=$1 AND sent='${ts}'::TIMESTAMP WITH TIME ZONE`,
        [station]
      );
      expect(rows.length).toBe(1);
    });
    it("without a signal strength", async () => {
      delete report.levelsender.signalStrength;
      await insertEmail(report);
      const rows = await db.query(
        `SELECT * FROM emails WHERE station=$1 AND sent='${ts}'::TIMESTAMP WITH TIME ZONE`,
        [station]
      );
      expect(rows.length).toBe(1);
      report.levelsender.signalStrength = 5;
    });
    it("with a 0 value", async () => {
      report.levelogger.logs = 0;
      await insertEmail(report);
      const rows = await db.query(
        `SELECT * FROM emails WHERE station=$1 AND sent='${ts}'::TIMESTAMP WITH TIME ZONE`,
        [station]
      );
      expect(rows.length).toBe(1);
      report.levelogger.logs = 45;
    });
  });
  it("saves the data", async () => {
    const id = await insertEmail(report);
    await insertData(id, report);
    const rows = await db.query("SELECT * FROM corrected WHERE email=$1", [id]);
    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.corrected).toBeGreaterThan(0);
      expect(row.corrected).toBeLessThanOrEqual(1);
    }
  });
});
