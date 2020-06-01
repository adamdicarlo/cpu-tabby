// Unix timestamp.
export type UnixEpoch = number;

// Load average for the last minute.
export type Load = number;

export interface Point {
  timestamp: UnixEpoch;
  load: Load;
}

export function Point(timestamp: UnixEpoch, load: Load): Point {
  return { timestamp, load };
}
