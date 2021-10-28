describe("db", () => {
  let db;
  beforeAll(() => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  it("can connect to the db", async () => {
    try {
      expect(db.query).toBeTruthy();
      expect(db.end).toBeTruthy();
    } catch (e) {
      expect("Connection failed: " + e.message).toBeFalsy();
    }
  });
  it("can query the db", async () => {
    try {
      const { query } = db;
      expect(query).toBeTruthy();
      const res = await query("SELECT * FROM water_stations WHERE gid>$1", [
        -1,
      ]);
      expect(res).toBeTruthy();
      expect(res.length).toBeGreaterThan(0);
    } catch (e) {
      expect("Query failed: " + e.message).toBeFalsy();
    }
  });
});
