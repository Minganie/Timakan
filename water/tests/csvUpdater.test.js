const fs = require("fs");

const { writeCsv, updateOne } = require("../src/csvUpdater");
const { csvPath } = require("config");
const data = require("./4_all.json");

async function readCsv(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: "utf8" }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

describe("csvUpdater", () => {
  let db, week4, year4, all4;
  beforeAll(async () => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  describe("writing csv", () => {
    beforeAll(async () => {
      try {
        let data = require("./4_week.json");
        let fileName = csvPath + "4_week.csv";
        await writeCsv(data, fileName);
        week4 = await readCsv(fileName);

        data = require("./4_all.json");
        fileName = csvPath + "4_all.csv";
        await writeCsv(data, fileName);
        all4 = await readCsv(fileName);

        data = require("./4_year.json");
        fileName = csvPath + "4_year.csv";
        await writeCsv(data, fileName);
        year4 = await readCsv(fileName);
      } catch (e) {
        console.error(e);
      }
    });

    it("can write a csv", async () => {
      const data = require("./3_all.json");
      const fileName = csvPath + "3_all.csv";
      await writeCsv(data, fileName);
      const contents = await readCsv(fileName);
      expect(contents).toBeTruthy();
      const lines = contents.split(/\r\n|\r|\n/);
      expect(lines.length).toBeGreaterThanOrEqual(118);
    });
    describe("includes the header", () => {
      it("header is in week", async () => {
        const lines = week4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/moment/);
      });
      it("header is in year", async () => {
        const lines = year4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/moment/);
      });
      it("header is in all", async () => {
        const lines = all4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/moment/);
      });
    });
    describe("includes corrected for all", () => {
      it("includes corrected for week", async () => {
        const lines = week4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/corrected/);
      });
      it("includes corrected for year", async () => {
        const lines = year4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/corrected/);
      });
      it("includes corrected for historic", async () => {
        const lines = all4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/corrected/);
      });
    });
    describe("includes stats for week and year", () => {
      it("includes the stats for the week", () => {
        const lines = week4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/q0/);
        expect(header).toMatch(/q10/);
        expect(header).toMatch(/q50/);
        expect(header).toMatch(/q90/);
        expect(header).toMatch(/q100/);
      });
      it("includes the stats for the year", () => {
        const lines = year4.split(/\r\n|\r|\n/);
        const header = lines[0];
        expect(header).toMatch(/q0/);
        expect(header).toMatch(/q10/);
        expect(header).toMatch(/q50/);
        expect(header).toMatch(/q90/);
        expect(header).toMatch(/q100/);
      });
    });
  });
  describe("db to csv", () => {
    function fileExists(fileName) {
      return new Promise((resolve, reject) => {
        fs.access(csvPath + "2_week.csv", (err) => {
          resolve(!err);
        });
      });
    }
    it("can write a csv from db data", async () => {
      try {
        await updateOne(2);
        const week = await fileExists(csvPath + "2_week.csv");
        expect(week).toBeTruthy();
        const year = await fileExists(csvPath + "2_year.csv");
        expect(year).toBeTruthy();
        const all = await fileExists(csvPath + "2_all.csv");
        expect(all).toBeTruthy();
      } catch (e) {
        expect("Failed to make a csv from db: " + e.message).toBeFalsy();
      }
    });
    it("doesn't choke on an empty station", async () => {
      try {
        await updateOne(200);
      } catch (e) {
        expect("Choked on an empty station: " + e.message).toBeFalsy();
      }
    });
  });
});
