const Harpy = require("./src/Harpy");
const { backup } = require("./src/backuper");

async function main() {
  try {
    await backup();
  } catch (e) {
    throw e;
  }
}

main().catch((e) => Harpy.notify(e));
