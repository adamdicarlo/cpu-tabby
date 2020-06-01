export class CPUTimeline<Point> {
  private _points: Point[] = [];

  constructor(readonly maxPoints: number) {
    if (maxPoints <= 0) {
      throw new RangeError(
        `CPUTimeline: maxPoints is ${maxPoints}; must be > 0`
      );
    }
  }

  add(point: Point): void {
    this._points.push(point);

    if (this._points.length > this.maxPoints) {
      // Delete oldest points in order to limit the number of points stored.
      // Since we only add one point at a time, we technically should not need
      // to handle `this.points.length` exceeding `this.maxPoints + 1`; we do
      // so here mostly because it's not difficult.
      this._points.splice(0, this._points.length - this.maxPoints);
    }
  }

  get points(): Point[] {
    return this._points;
  }
}
