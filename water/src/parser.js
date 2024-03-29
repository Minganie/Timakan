const P = require("parsimmon");

const regexes = {
  serial: /\s*Serial: (\d+)/,
  location: /\s*Location: ([a-zA-Z0-9\.\- ]+)/,
  battery: /\s*Battery: (\d+)%/,
  sampleRate: /\s*Sample Rate: (\d+ (?:minutes|hours))/,
  reportRate: /\s*Report Rate: (\d+ (?:minutes|hours))/,
  signalStrength: /\s*Signal Strength: (\d+)/,
  state: /\s*State: ([a-z]+)/,
  startReport: /\s*Start Report: (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  logger: /\s*Logger (\d)/,
  type: /\s*Location:.*?\s*Type: ([a-zA-Z0-9 ]+, [a-zA-Z0-9\.]+, [0-9\.]+)/,
  logs: /\s*Total Logs: (\d+ of \d+)/,
  logRate: /\s*Log Rate: (\d+) seconds/,
  memoryMode: /\s*Memory Mode: ([a-z]+)/,
  logType: /\s*Log Type: ([a-z]+)/,
  startLogger: /\s*Start Logger: (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  samples: /\s*Logger (\d) Samples/,
  dataHeader: /\s*Time, Temperature\( C\), ([a-zA-Z\(\)]+)\s*/,
  number: /-?\d+(\.\d+)?/,
  timestamp: /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  end: /\s*MESSAGES: .*/,
};

function shuffleDate(nobodyUsesThisFormat) {
  const [_, dd, mo, yyyy, hh, mi, ss] = nobodyUsesThisFormat.match(
    /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/
  );
  return {
    day: dd,
    month: mo,
    year: yyyy,
    hour: hh,
    minutes: mi,
    seconds: ss,
    string: `${yyyy}-${mo}-${dd}T${hh}:${mi}:${ss}`,
  };
}

function splitLoggerType(mumbo) {
  const [_, type, model, v] = mumbo.match(
    /^([a-zA-Z0-9 ]+), ([a-zA-Z0-9\.]+), ([0-9\.]+)/
  );
  return { type, model, v };
}

function getDurationMinutes(mumbo) {
  const [_, n, units] = mumbo.match(/\s*(\d+) (minutes|hours)/);
  switch (units) {
    case "minutes":
      return Number(n);
    case "hours":
      return Number(n) * 60;
    default:
      throw new Error("Unknown units in:" + mumbo);
  }
}

function splitLogNumbers(mumbo) {
  const [_, n, total] = mumbo.match(/(\d+) of (\d+)/);
  return { n, total };
}

const lang = P.createLanguage({
  dataLine: (r) =>
    P.seq(
      P.regexp(regexes.timestamp).skip(P.string(", ")),
      P.regexp(regexes.number).skip(P.string(", ")),
      P.regexp(regexes.number).skip(P.optWhitespace)
    ).map((arr) => {
      const [timestamp, temp, other] = arr;
      const dateBag = shuffleDate(timestamp);
      return {
        dateBag,
        timestamp: dateBag.string,
        temp: Number(temp),
        other: Number(other),
      };
    }),
  dataSection: (r) =>
    P.seq(
      P.regexp(regexes.samples, 1).skip(P.optWhitespace),
      P.regexp(regexes.dataHeader, 1).skip(P.optWhitespace),
      r.dataLine.many()
    ).map((arr) => {
      const [logger, unit, data] = arr;
      return { logger: Number(logger), unit, data };
    }),
  Logger: (r) =>
    P.seq(
      P.regexp(regexes.logger, 1).skip(P.optWhitespace),
      P.regexp(regexes.type, 1).skip(P.optWhitespace),
      P.regexp(regexes.serial, 1).skip(P.optWhitespace),
      P.regexp(regexes.battery, 1).skip(P.optWhitespace),
      P.regexp(regexes.logs, 1).skip(P.optWhitespace),
      P.regexp(regexes.logRate, 1).skip(P.optWhitespace),
      P.regexp(regexes.memoryMode, 1).skip(P.optWhitespace),
      P.regexp(regexes.logType, 1).skip(P.optWhitespace),
      P.regexp(regexes.state, 1).skip(P.optWhitespace),
      P.regexp(regexes.startLogger, 1).skip(P.optWhitespace)
    ).map((arr) => {
      const [
        logger,
        type,
        serial,
        battery,
        logs,
        logRate,
        memoryMode,
        logType,
        state,
        startLogger,
      ] = arr;
      const model = splitLoggerType(type);
      const { n, total } = splitLogNumbers(logs);
      const dateBag = shuffleDate(startLogger);
      return {
        logger: Number(logger),
        ...model,
        serial: Number(serial),
        battery: Number(battery),
        logs: Number(n),
        totalLogs: Number(total),
        logRate: Number(logRate),
        memoryMode,
        logType,
        state,
        startLogger: dateBag.string,
        dateBag,
      };
    }),
  LevelSender: (r) =>
    P.seq(
      P.regexp(/\s*LevelSender\s*/)
        .then(P.regexp(regexes.serial, 1))
        .skip(P.optWhitespace),
      P.regexp(regexes.location, 1).skip(P.optWhitespace),
      P.regexp(regexes.battery, 1).skip(P.optWhitespace),
      P.regexp(regexes.sampleRate, 1).skip(P.optWhitespace),
      P.regexp(regexes.reportRate, 1).skip(P.optWhitespace),
      P.regexp(regexes.signalStrength, 1).atMost(1),
      P.regexp(regexes.state, 1).skip(P.optWhitespace),
      P.regexp(regexes.startReport, 1).skip(P.optWhitespace)
    ).map((arr) => {
      const [
        serial,
        location,
        battery,
        sampleRate,
        reportRate,
        signalStrength,
        state,
        startReport,
      ] = arr;
      const dateBag = shuffleDate(startReport);
      return {
        serial: Number(serial),
        location,
        battery: Number(battery),
        sampleRate: getDurationMinutes(sampleRate), // minutes
        reportRate: getDurationMinutes(reportRate),
        signalStrength: Number(signalStrength),
        state,
        startReport: dateBag.string,
        dateBag,
      };
    }),
  report: (r) =>
    P.seq(
      r.LevelSender,
      r.Logger,
      r.Logger,
      r.dataSection,
      r.dataSection.skip(P.regexp(regexes.end)).skip(P.all)
    ).map((arr) => {
      const [levelsender, l1, l2, sec1, sec2] = arr;
      const levelogger = [l1, l2].find((l) =>
        ["M5", "M10", "M20", "M30", "M100", "M200"].includes(l.model)
      );
      const barologger = [l1, l2].find((l) => l.model === "M1.5");
      if (!levelogger)
        throw new Error("No Levelogger for " + levelsender.serial);
      if (!barologger)
        throw new Error("No Barologger for " + levelsender.serial);
      const levelData = [sec1, sec2].find(
        (d) => d.logger === levelogger.logger
      );
      const baroData = [sec1, sec2].find((d) => d.logger === barologger.logger);
      if (!levelData)
        throw new Error("No Level data for " + levelsender.serial);
      if (!baroData)
        throw new Error("No pressure data for " + levelsender.serial);
      return { levelsender, levelogger, barologger, levelData, baroData };
    }),
});

function parse(horror) {
  try {
    return lang.report.tryParse(horror);
  } catch (e) {
    e.emailBody = horror;
    throw e;
  }
}

module.exports = parse;
