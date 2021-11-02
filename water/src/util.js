// RFC 2822 3.3
function getMonth(threeLetters) {
  switch (threeLetters) {
    case "Jan":
      return "01";
    case "Feb":
      return "02";
    case "Mar":
      return "03";
    case "Apr":
      return "04";
    case "May":
      return "05";
    case "Jun":
      return "06";
    case "Jul":
      return "07";
    case "Aug":
      return "08";
    case "Sep":
      return "09";
    case "Oct":
      return "10";
    case "Nov":
      return "11";
    case "Dec":
      return "12";
    default:
      throw new Error("Unknown month: " + threeLetters);
  }
}

// RFC 2822 3.3
function makeIsoStringSigh(mumbo) {
  const date = mumbo.match(
    /.+?,\s+(\d{1,2})\s+([a-zA-Z]{3})\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\s+([\+-]\d{4}).*/
  );
  let [_, dd, mo, yyyy, hh, mi, ss, tz] = date;
  dd = String(dd).padStart(2, "0");
  mo = getMonth(mo);
  ss = ss ? ss : "00";
  return `${yyyy}-${mo}-${dd}T${hh}:${mi}:${ss}${tz}`;
}

function getDateFromHeaders(message) {
  const mumbo =
    message &&
    message.headers &&
    message.headers.get("received") &&
    message.headers.get("received").length &&
    message.headers.get("received")[0];
  if (mumbo) return makeIsoStringSigh(mumbo);
}

module.exports = {
  getMonth,
  makeIsoStringSigh,
  getDateFromHeaders,
};
