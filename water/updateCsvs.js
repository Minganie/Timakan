const { update } = require("./src/csvUpdater");
const Harpy = require("./src/Harpy");

update().catch((e) => Harpy.notify(e));
