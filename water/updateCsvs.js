const { update } = require("./src/csvUpdater");

update().catch((e) => console.error(e));
