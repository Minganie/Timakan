const { Buffer } = require("buffer");
const Client = require("ftp");

const { ftp } = require("config");

function makeHmJson(report) {
  const battery = 9.16023 + report.levelsender.battery * 0.0284091;
  const data = [];
  for (const line of report.hm.data) {
    data.push({
      time: line.moment,
      vals: [battery, line.p_temp, line.corrected, line.l_temp],
    });
  }
  return {
    head: {
      transaction: 0,
      signature: 0,
      environment: {
        station_name: "a",
        table_name: "a",
        model: "a",
        serial_no: "a",
        os_version: "a",
        prog_name: "a",
      },
      fields: [
        {
          name: "Batt_volt_Min",
          type: "xsd:float",
          process: "Min",
          settable: false,
        },
        {
          name: "PTemp",
          type: "xsd:float",
          process: "Smp",
          settable: false,
        },
        {
          name: "Water_Level",
          type: "xsd:float",
          units: "M",
          process: "Smp",
          settable: false,
        },
        {
          name: "Water_Temp",
          type: "xsd:float",
          units: "Degrees C",
          process: "Smp",
          settable: false,
        },
      ],
    },
    data,
  };
}

function makeHmString(report) {
  const json = makeHmJson(report);
  return JSON.stringify(json);
}

async function send(report) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(makeHmString(report));
    const client = new Client();
    client.on("ready", () => {
      client.put(
        buffer,
        `${ftp.path}${report.hm.id}.${report.hm.today}.dat`,
        (err) => {
          if (err) return reject(err);
          client.end();
          resolve(true);
        }
      );
    });
    client.connect({
      host: "soshydro.net",
      user: ftp.user,
      password: ftp.password,
    });
  });
}

module.exports = { makeHmJson, send };
