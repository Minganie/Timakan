const parse = require("../src/parser");

describe("parser", () => {
  let db;
  beforeAll(() => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  it("can parse a text string", () => {
    const txt = require("./firmware_3.0040");
    try {
      const report = parse(txt);
      expect(report).toBeTruthy();
      expect(report.levelsender.serial).toEqual("284272");
      expect(report.levelogger).toBeTruthy();
      expect(report.barologger).toBeTruthy();
      expect(report.levelData).toBeTruthy();
      expect(report.baroData).toBeTruthy();
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse the text from the db", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=1", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
      expect(report).toBeTruthy();
      expect(report.levelsender.serial).toEqual("284272");
      expect(report.levelogger).toBeTruthy();
      expect(report.barologger).toBeTruthy();
      expect(report.levelData).toBeTruthy();
      expect(report.baroData).toBeTruthy();
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse with a logger location", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=484040", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse without a logger location", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=495443", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse with a signal strength", async () => {
    const txt = require("./firmware_1.0040");
    try {
      const report = parse(txt);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse without a signal strength", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=495443", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse M1.5 barologgers", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=495443", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse a M5 leveloggers", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=495444", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
  it("can parse a M10 leveloggers", async () => {
    const rows = await db.query("SELECT body FROM emails WHERE id=495443", []);
    const body = rows[0].body;
    try {
      const report = parse(body);
    } catch (e) {
      expect(e.message).toBeFalsy();
    }
  });
});
