const config = require("config");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");

const Harpy = require("./Harpy");
const { makeShortString } = require("./util");

async function unlink(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
}

async function backup() {
  try {
    const { backup: bu } = config;
    const date = makeShortString(new Date(Date.now()));
    const filePath = `${bu.folder}timakan${date}.backup`;
    const command = `pg_dump --format=custom --file=${filePath} timakan`;
    await exec(command);
    const region = "us-east-2";
    const s3Client = new S3({ region }); // reads access key id and secret from envvars
    const results = await s3Client.send(
      new PutObjectCommand({
        Bucket: "timakan",
        Key: `timakan${date}.backup`,
        Body: fs.createReadStream(filePath),
      })
    );
    const { Contents } = await s3Client.listObjects({
      Bucket: "timakan",
    });
    if (Contents.length > 30) {
      Contents.sort((a, b) => a.LastModified - b.LastModified);
      const oldest = Contents[0].Key;
      await s3Client.deleteObject({
        Bucket: "timakan",
        Key: oldest,
      });
    }
    await unlink(filePath);
  } catch (e) {
    console.log(e);
    Harpy.notify(e);
  }
}

module.exports = { backup };
