function beforeJulyTwentySecond(dateBag) {
  let { year, month, day } = dateBag;
  year = Number(year);
  month = Number(month);
  day = Number(day);
  if (year > 2021) return false;
  if (year < 2021) return true;
  if (month > 7) return false;
  if (month < 7) return true;
  return day <= 21;
}

function zeroOffset362(report) {
  const { levelsender, levelData } = report;

  // because we had the zero level at -10 for a while...
  if (levelsender.location.includes("362")) {
    for (const line of levelData.data) {
      if (beforeJulyTwentySecond(line.dateBag)) {
        line.other += 10;
      }
    }
  }
  return report;
}

module.exports = { beforeJulyTwentySecond, zeroOffset362 };
