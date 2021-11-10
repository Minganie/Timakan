const parse = require("../src/parser");
const imaper = require("../src/imaper");
const { appendOffsetToTimestamps } = require("../src/appendOffsetToTimestamps");

describe("parser", () => {
  let db;
  beforeAll(() => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  describe("parse doesn't crash", () => {
    it("can parse a text string", () => {
      const txt = require("./firmware_3.0040");
      try {
        const report = parse(txt);
        expect(report).toBeTruthy();
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
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
    it("can parse with a logger location", async () => {
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=484040",
        []
      );
      const body = rows[0].body;
      try {
        const report = parse(body);
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
    it("can parse without a logger location", async () => {
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=495443",
        []
      );
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
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=495443",
        []
      );
      const body = rows[0].body;
      try {
        const report = parse(body);
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
    it("can parse M1.5 barologgers", async () => {
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=495443",
        []
      );
      const body = rows[0].body;
      try {
        const report = parse(body);
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
    it("can parse a M5 leveloggers", async () => {
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=495444",
        []
      );
      const body = rows[0].body;
      try {
        const report = parse(body);
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
    it("can parse a M10 leveloggers", async () => {
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=495443",
        []
      );
      const body = rows[0].body;
      try {
        const report = parse(body);
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
    it("can run the timestamp appender", async () => {
      const rows = await db.query(
        "SELECT body FROM emails WHERE id=495443",
        []
      );
      const body = rows[0].body;
      try {
        let report = parse(body);
        report = await appendOffsetToTimestamps(report);
      } catch (e) {
        expect(e.message).toBeFalsy();
      }
    });
  });
  describe("parses all data appropriately", () => {
    let report;
    beforeAll(async () => {
      const reports = await imaper();
      report = reports.find((r) => r.email.subject === "284274 LS Report 1");
      if (!report)
        throw new Error("No '284274 LS Report 1' email in scribe mailbox");
    });
    describe("email", () => {
      let email, levelsender, levelogger, barologger, levelData, baroData;
      beforeAll(() => {
        email = report.email;
        levelsender = report.levelsender;
        levelogger = report.levelogger;
        barologger = report.barologger;
      });
      it("num", () => {
        expect(email.num).toBe(1);
      });
      it("sent", () => {
        expect(email.receivedOn).toEqual("2021-11-01T19:54:02+0000");
      });
      it("level_logger", () => {
        expect(levelogger.serial).toBe(2126303);
      });
      it("pressure_logger", () => {
        expect(barologger.serial).toBe(2129811);
      });
      it("battery", () => {
        expect(levelsender.battery).toBe(91);
      });
      it("body", () => {
        expect(email.text).toBeTruthy();
      });
      it("sample_rate", () => {
        expect(levelsender.sampleRate).toBe(3 * 60);
      });
      it("report_rate", () => {
        expect(levelsender.reportRate).toBe(6 * 60);
      });
      it("state", () => {
        expect(levelsender.state).toEqual("reporting");
      });
      it("start_report", () => {
        expect(levelsender.startReport).toEqual("2021-11-01T09:53:09-04");
      });
      it("ll_type", () => {
        expect(levelogger.type).toEqual("Levelogger 5 LT");
      });
      it("ll_model", () => {
        expect(levelogger.model).toEqual("M10");
      });
      it("ll_v", () => {
        expect(levelogger.v).toEqual("1.0040");
      });
      it("ll_battery", () => {
        expect(levelogger.battery).toBe(98);
      });
      it("ll_n_logs", () => {
        expect(levelogger.logs).toBe(0);
      });
      it("ll_max_logs", () => {
        expect(levelogger.totalLogs).toBe(150000);
      });
      it("ll_rate", () => {
        expect(levelogger.logRate).toBe(5);
      });
      it("ll_mem", () => {
        expect(levelogger.memoryMode).toEqual("slate");
      });
      it("ll_log_type", () => {
        expect(levelogger.logType).toEqual("linear");
      });
      it("ll_state", () => {
        expect(levelogger.state).toEqual("stopped");
      });
      it("ll_start_logger", () => {
        expect(levelogger.startLogger).toEqual("1970-01-01T00:00:00-04");
      });
      it("pl_type", () => {
        expect(barologger.type).toEqual("Levelogger 5 LT");
      });
      it("pl_model", () => {
        expect(barologger.model).toEqual("M1.5");
      });
      it("pl_v", () => {
        expect(barologger.v).toEqual("1.0040");
      });
      it("pl_battery", () => {
        expect(barologger.battery).toBe(98);
      });
      it("pl_n_logs", () => {
        expect(barologger.logs).toBe(637);
      });
      it("pl_max_logs", () => {
        expect(barologger.totalLogs).toBe(150000);
      });
      it("pl_rate", () => {
        expect(barologger.logRate).toBe(300);
      });
      it("pl_mem", () => {
        expect(barologger.memoryMode).toEqual("slate");
      });
      it("pl_log_type", () => {
        expect(barologger.logType).toEqual("linear");
      });
      it("pl_state", () => {
        expect(barologger.state).toEqual("stopped");
      });
      it("pl_start_logger", () => {
        expect(barologger.startLogger).toEqual("2020-12-09T05:27:28-04");
      });
    });
    describe("level data", () => {
      let levelData;
      beforeAll(() => {
        levelData = report.levelData;
      });
      it("has two data points", () => {
        expect(levelData.data.length).toBe(2);
      });
      it("has the proper timestamp", () => {
        const timestamps = ["2021-11-01T09:53:09-04", "2021-11-01T12:53:09-04"];
        for (const line of levelData.data) {
          if (!timestamps.includes(line.timestamp))
            expect(line.timestamp).toBe(false);
        }
      });
      it("has the proper temperature", () => {
        const temps = [19.694, 19.141];
        for (const line of levelData.data) {
          if (!temps.includes(line.temp)) expect(line.temp).toBe(false);
        }
      });
      it("has the proper water level", () => {
        const levels = [10.2695, 10.3111];
        for (const line of levelData.data) {
          if (!levels.includes(line.other)) expect(line.other).toBe(false);
        }
      });
    });
    describe("pressure data", () => {
      let baroData;
      beforeAll(() => {
        baroData = report.baroData;
      });
      it("has two data points", () => {
        expect(baroData.data.length).toBe(2);
      });
      it("has the proper timestamp", () => {
        const timestamps = ["2021-11-01T09:53:09-04", "2021-11-01T12:53:09-04"];
        for (const line of baroData.data) {
          if (!timestamps.includes(line.timestamp))
            expect(line.timestamp).toBe(false);
        }
      });
      it("has the proper temperature", () => {
        const temps = [20.402, 19.559];
        for (const line of baroData.data) {
          if (!temps.includes(line.temp)) expect(line.temp).toBe(false);
        }
      });
      it("has the proper air pressure", () => {
        const pressure = [99.5158, 99.922];
        for (const line of baroData.data) {
          if (!pressure.includes(line.other)) expect(line.other).toBe(false);
        }
      });
    });
  });
});
