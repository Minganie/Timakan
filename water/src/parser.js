const P = require("parsimmon");

const regexes = {
  serial: /\s*Serial: (\d+)/,
  location: /\s*Location: ([a-zA-Z\- ]+)/,
  battery: /\s*Battery: (\d+)%/,
  sampleRate: /\s*Sample Rate: (\d+) minutes/,
  reportRate: /\s*Report Rate: (\d+) hours/,
  state: /\s*State: ([a-z]+)/,
  startReport: /\s*Start Report: (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  logger: /\s*Logger (\d)/,
  type: /\s*Location:\s*Type: ([a-zA-Z ]+, [a-zA-Z0-9\.]+, [0-9\.]+)/,
  logs: /\s*Total Logs: (\d+) of 40000/,
  logRate: /\s*Log Rate: (\d+) seconds/,
  memoryMode: /\s*Memory Mode: ([a-z]+)/,
  logType: /\s*Log Type: ([a-z]+)/,
  startLogger: /\s*Start Logger: (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  samples: /\s*Logger (\d) Samples/,
  dataHeader: /\s*Time, Temperature\( C\), ([a-zA-Z\(\)]+)\s*/,
  number: /-?\d+(\.\d+)?/,
  timestamp: /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
  end: /\s*MESSAGES: .+/,
};

function shuffleDate(nobodyUsesThisFormat) {
  const [_, dd, mo, yyyy, hh, mi, ss] = nobodyUsesThisFormat.match(
    /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/
  );
  return `${yyyy}-${mo}-${dd}T${hh}:${mi}:${ss}-05`;
}

function splitLoggerType(mumbo) {
  const [_, type, model, v] = mumbo.match(
    /([a-zA-Z ]+), ([a-zA-Z0-9\.]+), ([0-9\.]+)/
  );
  return { type, model, v };
}

function parse(horror) {
  const lang = P.createLanguage({
    dataLine: (r) =>
      P.seq(
        P.regexp(regexes.timestamp).skip(P.string(", ")),
        P.regexp(regexes.number).skip(P.string(", ")),
        P.regexp(regexes.number).skip(P.optWhitespace)
      ).map((arr) => {
        const [timestamp, temp, other] = arr;
        return {
          timestamp: shuffleDate(timestamp),
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
        return {
          logger: Number(logger),
          ...model,
          serial,
          battery: Number(battery),
          logs: Number(logs),
          logRate: Number(logRate),
          memoryMode,
          logType,
          state,
          startLogger: shuffleDate(startLogger),
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
        P.regexp(regexes.state, 1).skip(P.optWhitespace),
        P.regexp(regexes.startReport, 1).skip(P.optWhitespace)
      ).map((arr) => {
        const [
          serial,
          location,
          battery,
          sampleRate,
          reportRate,
          state,
          startReport,
        ] = arr;
        return {
          serial,
          location,
          battery: Number(battery),
          sampleRate: Number(sampleRate), // minutes
          reportRate: Number(reportRate) * 60, // minutes
          state,
          startReport: shuffleDate(startReport),
        };
      }),
    report: (r) =>
      P.seq(
        r.LevelSender,
        r.Logger,
        r.Logger,
        r.dataSection,
        r.dataSection.skip(P.regexp(regexes.end)).skip(P.optWhitespace)
      ).map((arr) => {
        const [levelsender, l1, l2, sec1, sec2] = arr;
        const levelogger = [l1, l2].find((l) => l.type.includes("Levelogger"));
        const barologger = [l1, l2].find((l) => l.type.includes("Barologger"));
        if (!levelogger)
          throw new Error("No Levelogger for " + levelsender.serial);
        if (!barologger)
          throw new Error("No Barologger for " + levelsender.serial);
        const levelData = [sec1, sec2].find(
          (d) => d.logger === levelogger.logger
        );
        const baroData = [sec1, sec2].find(
          (d) => d.logger === barologger.logger
        );
        if (!levelData)
          throw new Error("No Level data for " + levelsender.serial);
        if (!baroData)
          throw new Error("No pressure data for " + levelsender.serial);
        return { levelsender, levelogger, barologger, levelData, baroData };
      }),
  });
  return lang.report.tryParse(horror);
}

module.exports = parse;
