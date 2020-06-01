import React, { memo } from "react";
import { ResponsiveLine, Serie, SliceTooltipProps } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";

const TIME_WINDOW_MS = 10 * 60 * 1000;

// Default tooltip only displays the Y axis value in slice mode, but it's nice
// to have the time included. Nivo's slice mode divides the chart into vertical
// or horizontal slices (vertical, in our case) in order to detect which data
// point is being hovered. In our case, it means the hovered data point is the
// one whose x coordinate is closest to the mouse cursor.
const _CustomTooltip: React.FC<SliceTooltipProps> = ({ slice }) => {
  const { points } = slice;
  const { data, serieColor } = points[0];
  const content = (
    <span>
      CPU Load: <strong>{data.yFormatted}</strong> at{" "}
      <strong>{data.xFormatted}</strong>
    </span>
  );
  return <BasicTooltip id={content} enableChip color={serieColor} />;
};
const CustomTooltip = memo(_CustomTooltip);

type Props = {
  color: string;
  series: Serie[];
};

export const CPULoadChart: React.FC<Props> = ({ color, series }) => {
  const numPoints = series[0].data.length;
  if (numPoints === 0) {
    return null;
  }

  const latestPointX = series[0].data[numPoints - 1].x as number;
  const minX = new Date(latestPointX - TIME_WINDOW_MS);
  const maxX = new Date(latestPointX);

  return (
    <ResponsiveLine
      animate={false}
      areaOpacity={0.7}
      axisBottom={{
        format: "%X",
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        tickValues: 4,
      }}
      axisLeft={{
        format: ".0%",
        orient: "left",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: "CPU Load",
        legendOffset: -60,
        legendPosition: "middle",
      }}
      colors={[color]}
      data={series}
      enableArea
      enablePoints={false}
      enableSlices={"x"}
      enableGridX={false}
      margin={{ top: 50, right: 50, bottom: 50, left: 90 }}
      sliceTooltip={CustomTooltip}
      xFormat={"time:%X"}
      xScale={{
        type: "time",
        useUTC: false,
        min: minX,
        max: maxX,
      }}
      yFormat={".1%"}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
      }}
    />
  );
};
