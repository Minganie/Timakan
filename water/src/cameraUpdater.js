const axios = require("axios");
const fs = require("fs");

const db = require("./db");
const { cameras } = require("config");

async function writeJpeg(camId, stream) {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(cameras.path + camId + ".jpeg");
    stream.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function updateOneCamera(cam) {
  try {
    const res = await axios.get(
      "http://" + cam.ip + "/Streaming/channels/1/picture",
      {
        auth: {
          username: cameras.user,
          password: cameras.password,
        },
        responseType: "stream",
      }
    );
    if (res.status === 200) {
      await writeJpeg(cam.serial, res.data);
    } else {
      const msg = `Unable to fetch ${cam.name} @ ${cam.ip}`;
      const e = new Error(msg);
      e.camera = {
        ...cam,
        status: res.status,
        message: res.statusText,
      };
      throw e;
    }
  } catch (e) {
    if (!e.camera) e.camera = { ...cam };
    throw e;
  }
}

async function updateCameras() {
  const cams = await db.query("SELECT * FROM camera_stations", []);
  const errors = [];
  for (const cam of cams) {
    try {
      await updateOneCamera(cam);
    } catch (e) {
      errors.push(e);
    }
  }
  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    const e = new Error("Multiple errors while fetching camera images");
    e.camera = errors;
  }
}

module.exports = { updateOneCamera, updateCameras };
