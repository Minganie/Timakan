const {
  getMonth,
  makeIsoStringSigh,
  getDateFromHeaders,
} = require("../src/util");

const oneNumberDay = `Received: from LS (unknown [67.69.76.207])
\tby hydrometeocharlevoix.com (Postfix) with SMTP id 22BB4C5B2B;
\tMon,  1 Nov 2021 19:54:02 +0000 (UTC)`;
const twoNumberDay = `Received: from hydrometeocharlevoix.com
\tby hydrometeocharlevoix.com with LMTP id 4BacOvNFgGH3egAAF4vP9g
\t; Mon, 01 Nov 2021 19:54:02 +0000`;
const withoutSeconds = `Received: from LS (unknown [67.69.76.207])
\tby hydrometeocharlevoix.com (Postfix) with SMTP id 22BB4C5B2B;
\tMon,  1 Nov 2021 19:54 +0000 (UTC)`;
const withUTC = `from LS (unknown [67.69.76.200]) by hydrometeocharlevoix.com (Postfix) with SMTP id 56420C5B2B; Tue,  2 Nov 2021 13:54:02 +0000 (UTC)`;

const msg = {};
const headers = new Map();
headers.set("return-path", { value: {}, html: "", text: "" });
headers.set("received", [
  "from hydrometeocharlevoix.com by hydrometeocharlevoix.com with LMTP id oG1/BA1DgWEwHAAAF4vP9g ; Tue, 02 Nov 2021 13:54:02 +0000",
  "from LS (unknown [67.69.76.200]) by hydrometeocharlevoix.com (Postfix) with SMTP id 56420C5B2B; Tue,  2 Nov 2021 13:54:02 +0000 (UTC)",
]);
headers.set("from", { value: [], html: "", text: "" });
headers.set("to", { value: [], html: "", text: "" });
headers.set("cc", { value: [], html: "", text: "" });
headers.set("subject", "284274 LS Report 4");
headers.set("content-type", {
  value: "text/plain",
  params: { charset: "us-ascii." },
});
msg.headers = headers;

describe("util", () => {
  describe("getMonth", () => {
    it("can recognize January", () => {
      const l = getMonth("Jan");
      expect(l).toEqual("01");
    });
    it("can recognize February", () => {
      const l = getMonth("Feb");
      expect(l).toEqual("02");
    });
    it("can recognize March", () => {
      const l = getMonth("Mar");
      expect(l).toEqual("03");
    });
    it("can recognize April", () => {
      const l = getMonth("Apr");
      expect(l).toEqual("04");
    });
    it("can recognize May", () => {
      const l = getMonth("May");
      expect(l).toEqual("05");
    });
    it("can recognize June", () => {
      const l = getMonth("Jun");
      expect(l).toEqual("06");
    });
    it("can recognize July", () => {
      const l = getMonth("Jul");
      expect(l).toEqual("07");
    });
    it("can recognize August", () => {
      const l = getMonth("Aug");
      expect(l).toEqual("08");
    });
    it("can recognize September", () => {
      const l = getMonth("Sep");
      expect(l).toEqual("09");
    });
    it("can recognize October", () => {
      const l = getMonth("Oct");
      expect(l).toEqual("10");
    });
    it("can recognize November", () => {
      const l = getMonth("Nov");
      expect(l).toEqual("11");
    });
    it("can recognize December", () => {
      const l = getMonth("Dec");
      expect(l).toEqual("12");
    });
    it("should throw on Cat", () => {
      try {
        const l = getMonth("Cat");
      } catch (e) {
        expect(e.message.includes("month")).toBeTruthy();
      }
    });
  });
  describe("makeIsoStringSigh", () => {
    it("can make an iso string with one number days", () => {
      const iso = makeIsoStringSigh(oneNumberDay);
      expect(iso).toEqual("2021-11-01T19:54:02+0000");
    });
    it("can make an iso string two number days", () => {
      const iso = makeIsoStringSigh(twoNumberDay);
      expect(iso).toEqual("2021-11-01T19:54:02+0000");
    });
    it("can make an iso string with seconds", () => {
      const iso = makeIsoStringSigh(oneNumberDay);
      expect(iso).toEqual("2021-11-01T19:54:02+0000");
    });
    it("can make an iso string without seconds", () => {
      const iso = makeIsoStringSigh(withoutSeconds);
      expect(iso).toEqual("2021-11-01T19:54:00+0000");
    });
    it("can make an iso string with UTC tacked on at the end", () => {
      const iso = makeIsoStringSigh(withUTC);
      expect(iso).toEqual("2021-11-02T13:54:02+0000");
    });
  });
  describe("getDateFromHeaders", () => {
    it("can get a date from headers", () => {
      const iso = getDateFromHeaders(msg);
      expect(iso).toEqual("2021-11-02T13:54:02+0000");
    });
  });
});
