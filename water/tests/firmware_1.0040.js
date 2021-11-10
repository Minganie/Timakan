const txt = `


LevelSender
Serial: 284274
Location: Train
Battery: 87%
Sample Rate: 30 minutes
Report Rate: 1 hours
Signal Strength: 5
State: reporting
Start Report: 08/11/2021 13:00:00

Logger 1
Location:
Type: Levelogger 5 LT, M10, 1.0040
Serial: 2126303
Battery: 98%
Total Logs: 51 of 150000
Log Rate: 1800 seconds
Memory Mode: slate
Log Type: linear
State: started
Start Logger: 08/11/2021 13:00:00

Logger 2
Location:
Type: Levelogger 5 LT, M1.5, 1.0040
Serial: 2129811
Battery: 98%
Total Logs: 51 of 150000
Log Rate: 1800 seconds
Memory Mode: slate
Log Type: linear
State: started
Start Logger: 08/11/2021 13:00:00


Logger 1 Samples
Time, Temperature( C), Level(m)
09/11/2021 13:00:00, 18.5190, 10.4112
09/11/2021 13:30:00, 18.5210, 10.4134

Logger 2 Samples
Time, Temperature( C), Level(kPa)
09/11/2021 13:00:00, 18.9640, 100.898
09/11/2021 13:30:00, 18.9700, 100.923

MESSAGES: Email report 25, LS reporting, L1 started, L2 started,

`;
module.exports = txt;
