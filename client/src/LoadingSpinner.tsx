import React from "react";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles({
  "@keyframes rotate": {
    from: {
      transform: "rotate(-60deg)",
    },
    to: {
      transform: "rotate(300deg)",
    },
  },
  spin: {
    animation: "$rotate 2s linear infinite",
    fontSize: "6rem",
  },
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    display: "flex",
    width: "100%",
    height: "100%",
  },
});

export const LoadingSpinner = () => {
  const classes = useStyles();
  return (
    <div className={classes.wrap}>
      <span className={classes.spin} aria-label="Loading..." role="img">
        😺
      </span>
      <Typography variant="body1">Loading...</Typography>
    </div>
  );
};
