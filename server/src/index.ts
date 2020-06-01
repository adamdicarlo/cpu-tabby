// cpu tabby server entry point.
import express from "express";
import os from "os";
import { LoadTracker } from "./load-tracker";
import { CPUTimeline } from "./cpu-timeline";
import { Load, Point, UnixEpoch } from "./types";

interface StateAPIResponse {
  timeline: Point[];
  totalHighLoads: number;
  status: typeof tracker.status;
  statusSince: UnixEpoch;
  upSince: UnixEpoch;
}

// Listen on 127.0.0.1 so we only receive local requests.
const HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const CPU_COUNT = os.cpus().length;
const MAX_TIMELINE_MINUTES = 10;
const POLL_INTERVAL_MS = 10 * 1000;
const MAX_TIMELINE_POINTS = Math.ceil(
  (MAX_TIMELINE_MINUTES * 60 * 1000) / POLL_INTERVAL_MS
);

// TODO: Check whether we're on Windows, and abort with an error if so?
// (os.loadavg() doesn't work on Windows)

const startTime = Date.now();
const tracker = new LoadTracker();
const timeline = new CPUTimeline<Point>(MAX_TIMELINE_POINTS);
startPollingCPU(timeline, tracker, POLL_INTERVAL_MS);

const app = express();

app.get("/state", (_req, res) => {
  const jsonBody: StateAPIResponse = {
    timeline: timeline.points,
    totalHighLoads: tracker.totalHighLoads,
    status: tracker.status,
    statusSince: tracker.statusSince,
    upSince: startTime,
  };

  res.send(jsonBody);
});

app.listen(PORT, HOSTNAME, (err) => {
  if (err) {
    console.error(err);
    console.error("Cannot start server");
    process.exit(1);
  }
  console.log(`Listening on port ${PORT}`);
  console.log(`Observing ${CPU_COUNT} CPU cores`);
});

function startPollingCPU(
  timeline: CPUTimeline<Point>,
  tracker: LoadTracker,
  pollIntervalMS: number
): () => void {
  function pollCPULoad() {
    // Normalize last-minute load average (to a whole-CPU percentage) based on
    // how many CPUs the OS reports are in the system.
    const load = (os.loadavg()[0] / CPU_COUNT) as Load;

    const timestamp = Date.now() as UnixEpoch;
    const point = Point(timestamp, load);

    timeline.add(point);
    tracker.observe(point);
  }

  pollCPULoad();
  const intervalId = setInterval(pollCPULoad, pollIntervalMS);

  return () => clearInterval(intervalId);
}
