```
  _________  __  __   / /_____ _/ /_  / /_  __  __
 / ___/ __ \/ / / /  / __/ __ `/ __ \/ __ \/ / / /
/ /__/ /_/ / /_/ /  / /_/ /_/ / /_/ / /_/ / /_/ /
\___/ .___/\__,_/   \__/\__,_/_.___/_.___/\__, /
   /_/                                   /____/
```

**cpu tabby** is an app that monitors CPU usage levels on your computer, allowing you to see what the current and recent levels are, and when your CPU usage stays high for at least two minutes.

The app runs completely on your computer, but you’ll access its interface through a web browser.


## Setup

Make sure you have Node.js v13 installed. This is easiest by using [`Node Versions Manager (nvm)`](https://github.com/nvm-sh/nvm).

```bash
  # (not shown) Install nvm

  # Install (and activate) Node.js v13
  nvm install 13

  # (not shown) Install yarn 1.x; instructions at https://classic.yarnpkg.com/en/docs/install

  # Install dependencies
  yarn

  # Start the app - this will run both back-end and front-end in development mode
  yarn start
```

The front-end build takes a bit of time on the first run.

Your browser should automatically open to the app at [http://localhost:3000](http://localhost:3000). Have fun!


## Technical discussion

When the front-end makes an API request, it’s proxied through webpack-dev-server to the app’s server, which is running at [http://localhost:3001](http://localhost:3001).

Both server and client are "watched," so code changes will result in recompilation (for the client) and restarting (for the server).

Most of the front-end is in `Main.tsx`, and could use a refactoring, as the `Main` component has too many responsibilities. The first thing to extract would be data fetching, which would make it easier to write unit tests for the component and for the data fetching logic.

Sharing some code between front-end and back-end, like some of the type definitions, would have been nice, but setting that up seemed like it would be too time-consuming for this exercise.

Making the back-end’s timeline data format better match what the charting library expects would simplify the front-end.

### Decisions

1. Use TypeScript for practice, all the help it provides in avoiding bugs, and to (hopefully) make the code easier to follow.
2. Use yarn workspaces, as I’ve been curious to try it, and it’s a slightly less hacky approach than what I’ve done in the past, which was to make both the client’s and server’s "start" script first run `yarn` to ensure packages are installed. It also results in a single `yarn.lock` file that is smaller overall than separate lockfiles, because of shared dependencies.
3. Don’t use Next.js. I haven’t tried it yet, and it looks super neat. But its framework-like nature, and deep-baked server-side and static rendering support would make this app more complicated.
4. Use create-react-app (CRA). I recently tried Parcel and loved how straight-forward, easy, and fast it was, but it doesn’t have a built-in API proxy like CRA. Since CRA uses `webpack-dev-server`, it can easily be configured to not only serve assets (and manage UI builds), but also to proxy certain requests, acting like a basic API gateway. It’s not suitable for deployment, but it’s a handy development tool.
5. Use Material UI. It’s a rather heavy, complicated set of React components, but it should save time with building and styling, and I’m familiar with it. (There ended up being very little UI, but it was still somewhat handy.)
6. Keep 10 minutes of historical CPU load information on the back-end. If we collected data points on the front-end, with the back-end only returning the *current* CPU load (and not accumulating them), then closing the browser tab for a while would result in there being no historical data the next time it’s opened. With 10 minutes of data kept on the back-end, the front-end always has access to as much data as possible.
7. Color the page red as a way to notify the user of a high load state. I’d love to use notifications (as discussed below) but that seemed beyond the scope of a proof of concept.
8. Visualize the data (load over time). To me, it’s essential to have a chart in this kind of app.
9. Use the `nivo` chart library. I’d recently used Recharts, and a long time ago, plain old `d3`. I wanted more of an out-of-the-box solution for this project, and I was curious to try a new library. It was a pretty good experience, though I had to sand away some rough corners for edge cases, like when there’s only one point to show.


### Production considerations

I’d rather build this as a native app in order to get a tray icon, which could show CPU load as a tiny chart right in the tray. I’d look for a cross-platform solution, possibly for a lower-level language like Golang or Rust; this is the kind of app that I want to be small and efficient.

However, if I did need to productionize this as a local web app, I’d want to:

* Think more about the security of this app, and make sure that both the front-end and back-end can only be accessed locally, at least by default.
* Add actual OS notifications. This could be done with Service Worker push messages and the newer browser Notification API.
* Don’t color the entire chart red when in an alerting state; just highlight the time spans of the chart where violations (high load conditions) were active, instead.
* Consider adding web POST hooks for notifications to send a payload over the web (e.g. to If This Then That), for Internet of Things integration.
* Persist CPU load data to a database, so that older data could be seen, and if the process crashes or the computer’s rebooted, historical data wouldn’t be lost.
* Add page visibility tracking to avoid making requests and rerendering when the page/tab is not active.
* Automate the build tooling--running lint, prettier, and unit tests--and add CI.
* Build the front-end in production mode to avoid the run-time debug checks.
* Take the webpack-dev-server out for production mode. This might mean the back-end needs to serve the static assets.
* Run the back-end with a process manager that restarts it if/when it crashes.

