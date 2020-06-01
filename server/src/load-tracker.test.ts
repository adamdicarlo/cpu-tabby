import { LoadTracker } from "./load-tracker";
import { Point } from "./types";

const timestamp1 = 1590791210849;
const minutes = (n: number) => n * 60 * 1000;

describe("LoadTracker", () => {
  it("starts in the 'normal' status", () => {
    const t = new LoadTracker();
    expect(t.status).toBe("normal");
  });

  it("observes normal-load points without changing status", () => {
    const t = new LoadTracker();

    Array(60)
      .fill(null)
      .forEach((_, index) => {
        const timestamp = timestamp1 + minutes(index);
        t.observe(Point(timestamp, 0.5));

        expect(t.status).toBe("normal");
      });
  });

  it("does not change status after observing a single high load point", () => {
    const t = new LoadTracker();
    t.observe(Point(timestamp1, 2.0));

    expect(t.status).toBe("normal");
  });

  it("does not change status after observing high load points for less than two minutes", () => {
    const t = new LoadTracker();
    t.observe(Point(timestamp1, 2.0));
    t.observe(Point(timestamp1 + Math.floor(minutes(1.9)), 7.1));

    expect(t.status).toBe("normal");
  });

  it("changes status after observing high-load points for 2 minutes", () => {
    const t = new LoadTracker();
    t.observe(Point(timestamp1, 1.5));
    t.observe(Point(timestamp1 + minutes(1), 1.0));
    t.observe(Point(timestamp1 + minutes(2), 1.3));

    expect(t.status).toBe("high load");
    expect(t.statusSince).toBe(timestamp1 + minutes(2));
  });

  it("continues in 'high load' status while still observing high-load points", () => {
    const t = new LoadTracker();

    t.observe(Point(timestamp1, 7.9));

    Array(60)
      .fill(null)
      .forEach((_, index) => {
        const timestamp = timestamp1 + minutes(2 + index);
        t.observe(Point(timestamp, 7.9));
        expect(t.status).toBe("high load");
        expect(t.statusSince).toBe(timestamp1 + minutes(2));
      });
  });

  it("recovers from 'high load' status after 2 minutes of normal-load points", () => {
    const t = new LoadTracker();

    t.observe(Point(timestamp1, 7.9));
    t.observe(Point(timestamp1 + minutes(2), 7.9));
    expect(t.status).toBe("high load");

    t.observe(Point(timestamp1 + minutes(3), 0.9));
    t.observe(Point(timestamp1 + minutes(4), 0.7));
    t.observe(Point(timestamp1 + minutes(5), 0.6));

    expect(t.status).toBe("normal");
  });

  it("does not recover from 'high load' status when given inconsistent points", () => {
    const t = new LoadTracker();

    t.observe(Point(timestamp1, 7.9));
    t.observe(Point(timestamp1 + minutes(2), 7.9));
    expect(t.status).toBe("high load");

    t.observe(Point(timestamp1 + minutes(3), 0.9));
    expect(t.status).toBe("high load");

    t.observe(Point(timestamp1 + minutes(4), 2.0));
    expect(t.status).toBe("high load");

    t.observe(Point(timestamp1 + minutes(5), 0.5));
    expect(t.status).toBe("high load");
    expect(t.statusSince).toBe(timestamp1 + minutes(2));
    expect(t.totalHighLoads).toBe(1);
  });

  it("counts the number of 'high load' statuses that have occurred", () => {
    const t = new LoadTracker();

    t.observe(Point(timestamp1, 7.9));
    t.observe(Point(timestamp1 + minutes(15), 7.9));
    expect(t.totalHighLoads).toBe(1);

    // Recover
    t.observe(Point(timestamp1 + minutes(16), 0.1));
    t.observe(Point(timestamp1 + minutes(18), 0.1));

    // Go high again
    t.observe(Point(timestamp1 + minutes(19), 1.0));
    t.observe(Point(timestamp1 + minutes(21), 1.0));

    expect(t.totalHighLoads).toBe(2);
    expect(t.statusSince).toBe(timestamp1 + minutes(21));
  });
});
