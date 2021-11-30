const db = require("./src/db");
const Harpy = require("./src/Harpy");
const { updateCameras } = require("./src/cameraUpdater");

async function updateCams() {
  try {
    await updateCameras();
  } catch (e) {
  } finally {
    await db.end();
  }
}

updateCams().catch((e) => Harpy.notify(e));
