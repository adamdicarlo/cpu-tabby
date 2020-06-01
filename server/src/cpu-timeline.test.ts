import { CPUTimeline } from "./cpu-timeline";
import { Point } from "./types";

const timestamp1 = 1590791210849;
const timestamp2 = 1590791253321;

describe("CPUTimeline", () => {
  it("stores a data point", () => {
    const point = Point(timestamp1, 0.1);

    const timeline = new CPUTimeline(10);
    timeline.add(point);
    expect(timeline.get()).toEqual([point]);
  });

  it("stores no more than the given maxPoints", () => {
    const point1 = Point(timestamp1, 0.2);
    const point2 = Point(timestamp2, 3);
    const maxPoints = 1;

    const timeline = new CPUTimeline(maxPoints);

    timeline.add(point1);
    timeline.add(point2);

    expect(timeline.get()).toEqual([point2]);
  });

  it("stores multiple points", () => {
    const point1 = Point(timestamp1, 0.5);
    const point2 = Point(timestamp2, 4);
    const maxPoints = 2;

    const timeline = new CPUTimeline(maxPoints);

    timeline.add(point1);
    timeline.add(point2);

    expect(timeline.get()).toEqual([point1, point2]);
  });
});
