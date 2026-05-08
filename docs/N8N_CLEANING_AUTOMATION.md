# n8n Cleaning Automation

This project uses n8n as the scheduler/orchestrator and NestJS as the business
logic engine.

## Local services

```txt
FE:  http://localhost:5173
BE:  http://localhost:3000/api/v1
n8n: http://localhost:5678
```

When n8n runs in Docker on Windows/Mac, call the local backend with:

```txt
http://host.docker.internal:3000/api/v1
```

## Required backend env

```env
INTERNAL_AUTOMATION_TOKEN=dev-internal-token
CLEANING_AUTOMATION_STAFF_ID=1
```

## Cleaning Reasons

```txt
COMMON_AREA_DAILY  = Ve sinh khu vuc chung hang ngay
CHECKOUT_ROOM      = Don phong sau checkout 12:00
PRE_CHECKIN_ROOM   = Don phong truoc checkin 14:00
STAYOVER_ROOM      = Don phong hang ngay cho khach dang o
```

The reason is stored in `cleaning_details.comment` as an automation marker, so
the current implementation does not require a DB migration.

## Workflow Schedule

```txt
00:05 Daily Generate
  -> creates today's COMMON_AREA_DAILY, CHECKOUT_ROOM, PRE_CHECKIN_ROOM,
     and STAYOVER_ROOM tasks.

09:00 Daily Room Reminder
  -> reminds STAYOVER_ROOM tasks not started.

10:00 Common Area Reminder
  -> reminds COMMON_AREA_DAILY tasks not started.

12:15 Checkout Room Reminder
  -> reminds CHECKOUT_ROOM tasks not started after 12:00 checkout.

13:30 Pre-checkin Deadline Alert
  -> alerts PRE_CHECKIN_ROOM and CHECKOUT_ROOM tasks not finished before
     14:00 checkin.

18:00 Daily Summary
  -> sends totals by status and cleaning reason.

Manual Regenerate
  -> manual trigger only, force-regenerates not-started automation tasks.
```

## Daily Generate

```txt
POST http://host.docker.internal:3000/api/v1/internal/cleaning-shifts/generate
Authorization: Bearer dev-internal-token
Content-Type: application/json
```

Body:

```json
{
  "cleaningDate": "2026-05-01",
  "source": "n8n-daily-generate",
  "force": false,
  "cleaningReasons": [
    "COMMON_AREA_DAILY",
    "CHECKOUT_ROOM",
    "PRE_CHECKIN_ROOM",
    "STAYOVER_ROOM"
  ]
}
```

The generate endpoint is idempotent. Calling it again for the same date skips
existing active tasks instead of creating duplicates.

## Reminders

Not-started reminder endpoint:

```txt
POST http://host.docker.internal:3000/api/v1/internal/cleaning-shifts/remind-unstarted
Authorization: Bearer dev-internal-token
Content-Type: application/json
```

Example body:

```json
{
  "cleaningDate": "2026-05-01",
  "cleaningReasons": ["CHECKOUT_ROOM"]
}
```

Unfinished reminder endpoint:

```txt
POST http://host.docker.internal:3000/api/v1/internal/cleaning-shifts/remind-unfinished
Authorization: Bearer dev-internal-token
Content-Type: application/json
```

Example body for the 13:30 deadline:

```json
{
  "cleaningDate": "2026-05-01",
  "cleaningReasons": ["PRE_CHECKIN_ROOM", "CHECKOUT_ROOM"]
}
```

## Daily Summary

```txt
GET http://host.docker.internal:3000/api/v1/internal/cleaning-shifts/summary?cleaningDate=2026-05-01
Authorization: Bearer dev-internal-token
```

The response includes totals by task type, status, and cleaning reason.

## Importable Workflow Files

```txt
docs/n8n/workflows/cleaning-daily-generate.json
docs/n8n/workflows/cleaning-manual-regenerate.json
docs/n8n/workflows/cleaning-daily-room-reminder.json
docs/n8n/workflows/cleaning-common-area-reminder.json
docs/n8n/workflows/cleaning-checkout-room-reminder.json
docs/n8n/workflows/cleaning-precheckin-deadline-alert.json
docs/n8n/workflows/cleaning-daily-summary.json
```

Import each file from n8n:

```txt
Workflows -> Import from File
```

After importing, open the first Code node in each workflow and confirm:

```txt
backendBaseUrl = http://host.docker.internal:3000/api/v1
internalToken  = dev-internal-token
```

If n8n is not running in Docker, use:

```txt
backendBaseUrl = http://localhost:3000/api/v1
```

## Slack Connection

Each workflow includes a final HTTP node:

```txt
Send Slack Notification
```

It sends `slackPayload` to a Slack Incoming Webhook URL. Open the previous Code
node in each workflow and replace:

```txt
PASTE_SLACK_WEBHOOK_URL_HERE
```

with the real webhook URL, for example:

```txt
https://hooks.slack.com/services/...
```

Slack behavior:

```txt
Daily generate:             sends a generation summary
Manual regenerate:          sends a regenerate summary
Daily room reminder:        sends only when stayover room tasks are not started
Common area reminder:       sends only when common-area tasks are not started
Checkout room reminder:     sends only when checkout room tasks are not started
Pre-checkin deadline alert: sends only when rooms are not finished before 14:00
Daily summary:              sends end-of-day totals
```
