import { Point, UnixEpoch } from "./types";

// Statuses:
// - Normal: Load is < 1.
// - High-load: Load is >= 1.
type Status = "normal" | "high load";

// How long before consistently deviant results indicate we're in a new status.
const DEVIANCE_THRESHOLD_MS = 2 * 60 * 1000;

export class LoadTracker {
  // Track the most recent time we've seen a deviance; that is, a data point
  // where the load does not match our current official status. For instance,
  // when we're in the 'normal' status and we see a load >= 1, we store its
  // timestamp so we can determine how long the deviance lasts; if it lasts
  // long enough without dipping back below 1, then we change to the 'high
  // load' status.
  private deviantSince: UnixEpoch | null = null;

  status: Status = "normal";
  statusSince: UnixEpoch = Date.now();
  totalHighLoads: number = 0;

  observe(point: Point) {
    const pointStatus: Status = point.load >= 1 ? "high load" : "normal";

    if (this.status === pointStatus) {
      // point is not deviant, so forget about any deviance in progress.
      this.deviantSince = null;
    } else if (this.deviantSince) {
      const duration = point.timestamp - this.deviantSince;
      if (duration >= DEVIANCE_THRESHOLD_MS) {
        // Flip status, and reset deviance timestamp, since this is our new normal.
        this.status = this.status === "normal" ? "high load" : "normal";
        this.statusSince = point.timestamp;
        this.deviantSince = null;

        if (this.status === "high load") {
          this.totalHighLoads++;
        }
      }
    } else {
      this.deviantSince = point.timestamp;
    }
  }
}
