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

| env var   | default            | notes                        |
|-----------|--------------------|------------------------------|
| `PORT`    | `4000`             | HTTP port                    |
| `DB_PATH` | `pocketops.sqlite` | SQLite file, or `:memory:`   |

## Endpoints

| method + path                        | description                                  |
|--------------------------------------|----------------------------------------------|
| `GET  /health`                       | `{ ok: true }`                               |
| `GET  /api/incidents`                | active queue, critical first then oldest      |
| `GET  /api/incidents/history`        | acknowledged incidents, newest first         |
| `GET  /api/incidents/:id`            | one incident (either state)                   |
| `POST /api/incidents/:id/acknowledge`| mark acknowledged (idempotent)               |
| `POST /api/incidents`                | create one: `{ service, severity, summary }` |

`severity` is `"critical"` or `"high"`.

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
