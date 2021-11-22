const { bugsnag } = require("config");
const Harpy = {};

function addReport(event) {
  const { originalError } = event;
  if (originalError.report) {
    event.addMetadata("report", originalError.report);
  }
}
function addEmail(event) {
  const { originalError } = event;
  if (
    originalError.emailRaw ||
    originalError.emailHeaders ||
    originalError.emailBody
  ) {
    const email = {};
    if (originalError.emailRaw) email.raw = originalError.emailRaw;
    if (originalError.emailHeaders) email.headers = originalError.emailHeaders;
    if (originalError.emailBody) email.body = originalError.emailBody;
    event.addMetadata("email", email);
  }
}

if (process.env.NODE_ENV === "production") {
  const Bugsnag = require("@bugsnag/js");
  Bugsnag.start({
    apiKey: bugsnag.apiKey,
    onError: (event) => {
      addReport(event);
      addEmail(event);
    },
    logger: null,
  });
  Harpy.notify = Bugsnag.notify;
} else {
  Harpy.notify = (e) => console.error(e);
}

module.exports = Harpy;
