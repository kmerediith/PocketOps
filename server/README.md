# PocketOps API

Small Express + SQLite service backing the PocketOps app. Replaces the mock
incident source with a real, persistent one.

## Run

```bash
cd server
npm install
npm start          # http://localhost:4000
```

On first start it creates `pocketops.sqlite` and seeds it with the sample
incident queue. Delete that file to reset.

```bash
npm test           # node:test suite (uses an in-memory DB)
```

## Config

| env var                 | default            | notes                                          |
|-------------------------|--------------------|------------------------------------------------|
| `PORT`                  | `4000`             | HTTP port                                       |
| `DB_PATH`               | `pocketops.sqlite` | SQLite file, or `:memory:`                      |
| `INCIDENT_INTERVAL_MS`  | `30000`            | how often a new incident is generated; `0` off  |

## Incoming incidents

While the server runs it drops a fresh, randomised incident into the queue every
`INCIDENT_INTERVAL_MS` (default 30s), so the app's feed keeps moving. Set
`INCIDENT_INTERVAL_MS=0` to turn the generator off. `POST /api/incidents/simulate`
generates one on demand.

## Endpoints

| method + path                        | description                                  |
|--------------------------------------|----------------------------------------------|
| `GET  /health`                       | `{ ok: true }`                               |
| `GET  /api/regions`                  | data center regions: `[{ code, name }]`      |
| `GET  /api/incidents`                | active queue, critical first then newest      |
| `GET  /api/incidents/history`        | acknowledged incidents, newest first         |
| `GET  /api/incidents/:id`            | one incident (either state)                   |
| `POST /api/incidents/:id/acknowledge`| mark acknowledged (idempotent)               |
| `POST /api/incidents`                | create one: `{ service, severity, summary, region? }` |
| `POST /api/incidents/simulate`       | generate one randomised incident now         |

`severity` is `"critical"` or `"high"`. `region` is one of the codes from
`/api/regions` (`us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`) and
defaults to `us-east-1`. Databases created before regions existed are migrated
on startup; their existing incidents land in `us-east-1`. Delete
`pocketops.sqlite` to reseed with incidents spread across all regions.

## Pointing the app at this server

The app reads `EXPO_PUBLIC_API_URL` (see `../.env.example`), defaulting to
`http://localhost:4000`.

- **iOS simulator / web:** `http://localhost:4000` works as-is.
- **Android emulator:** use `http://10.0.2.2:4000`.
- **Physical device (Expo Go):** use your machine's LAN IP, e.g.
  `http://192.168.1.20:4000`, and keep the phone on the same network.

Set it in a root `.env` file before starting Expo:

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```
