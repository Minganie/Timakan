const { beforeJulyTwentySecond } = require("../src/zeroOffset362");
describe("zeroOffset362", () => {
  let dateBag;
  beforeEach(() => {
    dateBag = { year: "2021", month: "07", day: "21" };
  });
  describe("knows this is before 2021-07-22", () => {
    it("is one day before", () => {
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(true);
    });
    it("is one month before", () => {
      dateBag.month = "06";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(true);
    });
    it("is one year before", () => {
      dateBag.year = "2020";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(true);
    });
    it("is year before, month after", () => {
      dateBag.year = "2020";
      dateBag.month = "12";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(true);
    });
  });
  describe("knows this is on or after 2021-07-22", () => {
    it("is the day", () => {
      dateBag.day = "22";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(false);
    });
    it("is one day after", () => {
      dateBag.day = "23";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(false);
    });
    it("is one month after", () => {
      dateBag.month = "08";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(false);
    });
    it("is one year after", () => {
      dateBag.year = "2022";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(false);
    });
    it("is year after, month before", () => {
      dateBag.year = "2022";
      dateBag.month = "06";
      const before = beforeJulyTwentySecond(dateBag);
      expect(before).toBe(false);
    });
  });
});
