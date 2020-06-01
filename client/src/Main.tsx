import React, { useEffect, useState } from "react";
import {
  makeStyles,
  useTheme,
  AppBar,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Serie } from "@nivo/line";
import { CPULoadChart } from "./CPULoadChart";
import { LoadingSpinner } from "./LoadingSpinner";

type Timeline = Array<{ timestamp: number; load: number }>;
type Status = "normal" | "high load" | "unknown";
interface State {
  // load data formatted for CPULoadChart
  series: Serie[];

  // Current status (from server)
  status: Status;

  // When the current status started (from server)
  statusSince: Date;

  // How long the server's been up (from server)
  upSince: Date;

  // Total number of high loads since server's been up (from server)
  totalHighLoads: number;
}
type StyleProps = Pick<State, "status">;

const POLL_INTERVAL_MS = 10 * 1000;

function colorForStatus(theme: Theme, status: Status): string {
  const colorMap = {
    unknown: theme.palette.grey.A400,
    normal: theme.palette.info.light,
    "high load": theme.palette.error.dark,
  };
  return colorMap[status];
}

function timelineToSerie(timeline: Timeline): Serie {
  return {
    id: "CPU Load",
    data: timeline.map(({ timestamp, load }) => ({
      x: new Date(timestamp),
      y: load,
    })),
  };
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  chartContainer: {
    alignSelf: "center",
    flex: "0 1 100%",
    minHeight: 0,
    maxWidth: 1440,
    width: "100%",
  },
  toolbar: {
    backgroundColor: ({ status }) => colorForStatus(theme, status),
    display: "flex",
    justifyContent: "space-between",
  },
  main: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    textTransform: "uppercase",
    fontSize: "1.5rem",
    fontWeight: theme.typography.fontWeightMedium,
  },
  status: {
    fontSize: "1rem",
  },
  history: {
    fontSize: "1rem",
  },
}));

export const Main: React.FC<{}> = () => {
  const [state, setState] = useState<State | null>(null);
  const [shouldFetch, setShouldFetch] = useState<boolean>(true);
  const status = state ? state.status : "unknown";
  const haveData = state !== null && state.series[0].data.length > 0;
  const classes = useStyles({ status });
  const theme = useTheme();

  // Cause the fetch effect to re-fetch 10 seconds after every time it finishes.
  useEffect(() => {
    const timeoutId = setTimeout(() => setShouldFetch(true), POLL_INTERVAL_MS);
    return () => clearTimeout(timeoutId);
  }, [state]);

  useEffect(() => {
    // Since this effect needs to access state (so it needs to be a dep) and
    // mutate it, we use a separate state variable to track when we should
    // actually run the fetch (to avoid an infinite loop of each fetch
    // immediately triggering another fetch).
    if (shouldFetch) {
      setShouldFetch(false);
      refresh();
    }

    async function refresh() {
      try {
        const res = await fetch("/state");
        const data = await res.json();
        const { status, statusSince, timeline, totalHighLoads, upSince } = data;

        setState({
          series: [timelineToSerie(timeline)],
          status,
          statusSince: new Date(statusSince),
          totalHighLoads,
          upSince: new Date(upSince),
        });
      } catch (err) {
        setState({
          series: state?.series || [timelineToSerie([])],
          statusSince: new Date(),
          status: "unknown",
          totalHighLoads: state?.totalHighLoads || 0,
          upSince: state?.upSince || new Date(),
        });
        console.error(err);
      }
    }
  }, [shouldFetch, state]);

  return (
    <div className={classes.main}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar} variant="dense">
          <Typography className={classes.logo} variant="h1">
            <span aria-label="logo" role="img">
              😺
            </span>{" "}
            cpu tabby
          </Typography>
          {state && (
            <>
              <Typography className={classes.status} variant="h2">
                <strong>{status === "high load" ? "alert" : "normal"}</strong>{" "}
                since {state.statusSince.toLocaleString()}
              </Typography>
              <Typography className={classes.history} variant="h2">
                <strong>
                  {state.totalHighLoads}{" "}
                  {state.totalHighLoads === 1 ? "alert" : "alerts"}
                </strong>{" "}
                since {state.upSince.toLocaleString()}
              </Typography>
            </>
          )}
        </Toolbar>
      </AppBar>
      <div className={classes.chartContainer}>
        {haveData ? (
          <CPULoadChart
            color={colorForStatus(theme, state!.status)}
            series={state!.series}
          />
        ) : (
          <LoadingSpinner />
        )}
      </div>
    </div>
  );
};
