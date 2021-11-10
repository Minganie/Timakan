const { findOffset } = require("../src/appendOffsetToTimestamps");
describe("append offsets to timestamps", () => {
  let db;
  beforeAll(() => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  it("can tell this is daytime savings time", async () => {
    const offset = await findOffset("2021-05-21T03:12:00");
    expect(offset).toEqual("-04");
  });
  it("can tell this is standard time", async () => {
    const offset = await findOffset("2021-01-21T03:12:00");
    expect(offset).toEqual("-05");
  });
});
