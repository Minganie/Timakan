const parse = require("./src/parser");
const save = require("./src/saver");
const imaper = require("./src/imaper");
const { empty, reread } = require("./src/rereader");
const db = require("./src/db");
const debug = require("debug")("timakan:main");
const txt = `

LevelSender
Serial: 284272
Location: riviere Gros-Bras
Battery: 77%
Sample Rate: 30 minutes
Report Rate: 6 hours
State: reporting 
Start Report: 17/12/2018 13:00:00

Logger 1
Location: 
Type: Levelogger Edge, M5, 3.0040
Serial: 2085343
Battery: 100%
Total Logs: 2 of 40000
Log Rate: 300 seconds
Memory Mode: slate
Log Type: linear
State: stopped
Start Logger: 24/02/2018 01:59:43

Logger 2
Location: 
Type: Barologger Edge, M1.5, 3.0040
Serial: 2086270
Battery: 100%
Total Logs: 2 of 40000
Log Rate: 300 seconds
Memory Mode: slate
Log Type: linear
State: stopped
Start Logger: 23/02/2018 14:54:37


Logger 1 Samples
Time, Temperature( C), Level(m)
21/12/2018 07:00:00, 0.3199, 10.6673  
21/12/2018 07:30:00, 0.3228, 10.6686  
21/12/2018 08:00:00, 0.3191, 10.6684  
21/12/2018 08:30:00, 0.3193, 10.6616  
21/12/2018 09:00:00, 0.3083, 10.6569  
21/12/2018 09:30:00, 0.3198, 10.6452  
21/12/2018 10:00:00, 0.2784, 10.6528  
21/12/2018 10:30:00, 0.2668, 10.6404  
21/12/2018 11:00:00, 0.1266, 10.6338  
21/12/2018 11:30:00, 0.0876, 10.6250  
21/12/2018 12:00:00, 0.0265, 10.6224  
21/12/2018 12:30:00, -0.0263, 10.6178  

Logger 2 Samples
Time, Temperature( C), Level(kPa)
21/12/2018 07:00:00, -0.3961, 100.224  
21/12/2018 07:30:00, -0.3366, 100.241  
21/12/2018 08:00:00, -0.2628, 100.237  
21/12/2018 08:30:00, -0.2273, 100.193  
21/12/2018 09:00:00, -0.2098, 100.109  
21/12/2018 09:30:00, -0.1931, 100.002  
21/12/2018 10:00:00, -0.0764, 100.033  
21/12/2018 10:30:00, -0.0101, 99.8912  
21/12/2018 11:00:00, 0.0357, 99.8033  
21/12/2018 11:30:00, 0.0482, 99.6769  
21/12/2018 12:00:00, 0.1354, 99.5786  
21/12/2018 12:30:00, 0.3591, 99.4689  

MESSAGES: Email report 16, LS reporting, L1 stopped, L2 stopped, 

`;
async function main() {
  // const report = parse(txt);
  // report.email = {
  //   num: 1,
  //   sent: "2018-12-21T12:30:00-04",
  // };
  // await save(report);

  await empty();
  await reread();

  await db.end();
}

main().catch((e) => console.error(e));
