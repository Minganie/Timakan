const { bugsnag } = require("config");
const Harpy = {};

if (process.env.NODE_ENV === "production") {
  const Bugsnag = require("@bugsnag/js");
  Bugsnag.start({ apiKey: bugsnag.apiKey });
  Harpy.notify = Bugsnag.notify;
} else {
  Harpy.notify = (e) => console.error(e);
}

module.exports = Harpy;
