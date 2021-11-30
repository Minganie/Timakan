const { cameras } = require("config");
const { updateOneCamera } = require("../src/cameraUpdater");
const fs = require("fs");

async function recentlyModified(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) return reject(err);
      const diff = new Date(Date.now()) - stats.mtime; // milliseconds
      resolve(diff < 2000);
    });
  });
}

describe("Camera Updater", () => {
  let db;
  beforeAll(() => {
    db = require("../src/db");
  });
  afterAll(async () => {
    await db.end();
  });
  it("can update one camera", async () => {
    const camera = {
      serial: 1,
      name: "Bras du Nord-Ouest",
      geom: "0101000020E6100000DBBE7773ABA951C082AB5A75B8B14740",
      ip: "66.171.62.24",
    };
    try {
      await updateOneCamera(camera);
      const path = cameras.path + camera.serial + ".jpeg";
      const recent = await recentlyModified(path);
      expect(recent).toBe(true);
    } catch (e) {
      expect(e.message).toBe(false);
    }
  });
});
