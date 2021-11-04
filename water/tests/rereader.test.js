const parse = require("../src/parser");

async function matchDates(db, emailId) {
  const res = await db.query("SELECT body FROM emails WHERE id=$1", [emailId]);
  const body = res[0].body;
  const { levelData } = parse(body);
  const { data } = levelData;
  const rows = await db.query(
    `SELECT to_char(moment AT TIME ZONE 'America/Montreal', 'YYYY-MM-DD"T"HH24:MI:SS-05') as moment, level, pressure FROM corrected WHERE email=$1`,
    [emailId]
  );
  for (const emailDate of data) {
    let found = false;
    for (const bdDate of rows) {
      if (emailDate.timestamp === bdDate.moment) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log("email");
      console.log(data);
      console.log("db");
      console.log(rows);
      expect("Missing db date for " + emailDate.timestamp).toBeFalsy();
    }
  }
}

describe("rereader", () => {
  let db;
  beforeAll(() => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  it("fixed the dates", async () => {
    const emailIds = [1, 523623];
    for (const emailId of emailIds) {
      await matchDates(db, emailId);
    }
  });
  it("restored all data", async () => {
    const before = {
      corrected: 161162, // SELECT count(id) as c FROM corrected;
      corrected_rejected: 77, // SELECT count(id) as c FROM corrected_rejected;
    };
    const after = {};
    let rows = await db.query("SELECT count(id) as c FROM corrected");
    after.corrected = rows[0].c;
    rows = await db.query("SELECT count(id) as c FROM corrected_rejected");
    after.corrected_rejected = rows[0].c;

    expect(after.corrected).toEqual(before.corrected);
    expect(after.corrected_rejected).toEqual(before.corrected_rejected);
  });
});
