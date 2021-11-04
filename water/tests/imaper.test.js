describe("imaper", () => {
  it("can connect to a mailbox", async () => {
    try {
      const imaper = require("../src/imaper");
      const res = await imaper();
      expect(res).toBeTruthy();
    } catch (e) {
      expect("Connecting failed: " + e.message).toBeFalsy();
    }
  });
  it("can fetch messages from INBOX", async () => {
    try {
      const imaper = require("../src/imaper");
      const res = await imaper();
      expect(res).toBeTruthy();
      expect(res.length).toBeGreaterThan(0);
    } catch (e) {
      expect("Fetching failed: " + e.message).toBeFalsy();
    }
  });

  it("can parse an email into a report", async () => {
    try {
      const imaper = require("../src/imaper");
      const messages = await imaper();
      const report1 = messages.find((m) => m.subject.includes("LS Report 1"));
      expect(report1).toBeTruthy();
    } catch (e) {
      expect("Fetching failed: " + e.message).toBeFalsy();
    }
  });
});
