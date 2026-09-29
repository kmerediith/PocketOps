# PocketOps

A mobile incident console for data center on-call engineers, built with Expo
(SDK 57) and React Native Paper. Engineers see the live queue of hardware
incidents, filter it by region, acknowledge incidents with one tap, and review
or clear the resolved history, including while offline.

Author: Kyle Meredith

## Features

- **Live queue**: active incidents grouped into collapsible Critical / High
  sections, polled from the API every 10 seconds and on app foreground.
- **Region filter**: multi-select chips shared by the Incidents and History
  screens, remembered on-device.
- **Offline support**: the last lists are cached on-device; acknowledge and
  delete apply instantly and queue in a persisted outbox that syncs, in order,
  once the server is reachable. The server wins on conflicts.
- **History**: acknowledged incidents, with per-item and delete-all actions.

## Getting started

Start the API (see [server/README.md](server/README.md) for details):

```bash
npm run server:install
npm run server          # http://localhost:4000
```

Then start the app in another terminal:

```bash
npm install
npm start               # or: npm run android / ios / web
```

The app reads the API URL from `EXPO_PUBLIC_API_URL`. Copy `.env.example`
to `.env` and change it when running on an Android emulator
(`http://10.0.2.2:4000`) or a physical device (your machine's LAN IP).

Run the server tests with `npm run server:test`.

## Project layout

| Path | Contents |
|------|----------|
| `App.js`, `index.js` | Entry point and provider tree |
| `navigation/` | Stack + drawer navigator and the Material app bar |
| `screens/` | Incidents, Incident detail, History, Settings |
| `components/` | Incident cards and feed, region filter bar, sync banner, dialogs |
| `context/` | `IncidentsContext` (data, sync, outbox) and `RegionFilterContext` |
| `services/` | API client, outbox reducers, AsyncStorage helpers |
| `theme.js` | Design tokens and the Paper / Navigation themes |
| `server/` | Express + SQLite API |


