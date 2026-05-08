# Use Case 13 - n8n Automation Workflows

Use Case 13 gom cac tac vu tu dong hoa van hanh khach san: xu ly su kien dat phong,
nhac check-in, gui huong dan direct check-in, tao task don dep sau check-out, nhac
cong no, gui bien nhan va gui bao cao dinh ky.

## Local services

```txt
FE:  http://localhost:5173
BE:  http://localhost:3000/api/v1
n8n: http://localhost:5678
```

Khi n8n chay bang Docker tren Windows/Mac, workflow goi backend qua:

```txt
http://host.docker.internal:3000/api/v1
```

## Cau hinh can thay sau khi import

Mo node `Build ... Payload` hoac `Build ... Config` dau workflow va kiem tra:

```txt
backendBaseUrl = http://host.docker.internal:3000/api/v1
internalToken  = dev-internal-token
```

Neu n8n khong chay trong Docker, doi `backendBaseUrl` thanh:

```txt
http://localhost:3000/api/v1
```

Moi workflow co node `Send Slack Notification` de bao loi/tom tat van hanh noi bo.
Thay placeholder sau bang Slack Incoming Webhook that:

```txt
PASTE_SLACK_WEBHOOK_URL_HERE
```

## Importable workflow files

```txt
docs/n8n/workflows/uc13-reservation-event-router.json
docs/n8n/workflows/uc13-checkin-direct-checkin-scan.json
docs/n8n/workflows/uc13-checkout-post-processing.json
docs/n8n/workflows/uc13-payment-reminders-and-receipts.json
docs/n8n/workflows/uc13-management-report-daily.json
docs/n8n/workflows/uc13-automation-manual-retry.json
```

Import tung file trong n8n:

```txt
Workflows -> Import from File
```

## Workflow 1 - Tu dong hoa khi tao/cap nhat dat phong

Trigger: webhook tu backend sau khi tao/cap nhat dat phong.

Webhook path:

```txt
POST /webhook/hotel/reservation-created-automation
```

Workflow xac thuc HMAC/token, lay context dat phong, gui email xac nhan bang SMTP,
tao task housekeeping truoc check-in 2 gio, gui huong dan direct check-in neu duoc
bat va tao lich nhac:

```txt
Khach hang: truoc check-in 24 gio qua Email/SMS
Le tan: truoc check-in 1 gio qua thong bao noi bo
```

## Workflow 2 - Check-in / Direct Check-in Scan

Trigger: lich chay hang ngay luc 08:00.

Workflow quet cac dat phong sap check-in, kiem tra trang thai hop le va gui nhac
check-in/direct check-in theo cau hinh.

## Workflow 3 - Checkout Post Processing

Trigger: webhook tu backend sau khi check-out thanh cong.

Webhook path:

```txt
POST /webhook/hotel/checkout-completed
```

Workflow tao task don dep theo phong/co so, thong bao nhom ve sinh va len lich nhac
cong no neu phieu dat phong con thieu tien.

## Workflow 4 - Payment Reminders and Receipts

Trigger:

```txt
0 9 * * *                       # quet cong no hang ngay luc 09:00
POST /webhook/hotel/payment-completed
```

Workflow gui nhac thanh toan cho cac khoan den han, dung lich nhac khi thanh toan
du va gui bien nhan/hoa don PDF neu cau hinh yeu cau.

## Workflow 5 - Bao cao van hanh tu dong hang ngay

Trigger: lich chay hang ngay luc 07:00.

Workflow goi song song cac API check-in/check-out, occupancy va overdue payments,
format bang HTML, gui email cho quan ly va gui tom tat qua Slack/Telegram. Cac node
phan phoi co retry va canh bao loi rieng neu gui that bai.

## Workflow 6 - Manual Retry

Trigger: manual trigger trong n8n.

Workflow goi API replay cac automation event/job that bai de nhan vien co the chay
lai sau khi sua cau hinh gateway/API.

## Backend APIs can implement sau

Tat ca endpoint ben duoi gia dinh dung header noi bo:

```txt
Authorization: Bearer <INTERNAL_AUTOMATION_TOKEN>
Content-Type: application/json
```

### Event/idempotency

```txt
POST /api/v1/internal/automation-events/claim
POST /api/v1/internal/automation-events/log
POST /api/v1/internal/automation-events/replay-failed
```

Muc dich:
- `claim`: nhan `eventId`, `eventType`, `idempotencyKey`, `payload`; tra ve trang thai da claim/chay trung.
- `log`: luu ket qua thanh cong/that bai cua tung workflow/job.
- `replay-failed`: chay lai cac event/job that bai theo ngay, loai workflow hoac gioi han so luong.

### Reservation automation

```txt
GET  /api/v1/internal/automation/reservations/:reservationId/context
POST /api/v1/internal/housekeeping/tasks
POST /api/v1/internal/automation/reservations/:reservationId/reminder-jobs
POST /api/v1/internal/automation/reservations/process-event
POST /api/v1/internal/automation/check-in/run
```

Muc dich:
- `GET .../:reservationId/context`: tra ve day du context cho email xac nhan/direct check-in: reservation, customer, room, facility, tong tien, check-in/check-out, directCheckIn config, guide URL, cleaning due time.
- `POST /internal/housekeeping/tasks`: tao task don phong/pre-check-in, gan cho team housekeeping, han hoan thanh truoc check-in 2 gio.
- `POST .../:reservationId/reminder-jobs`: tao lich nhac khach truoc 24 gio va nhac le tan truoc 1 gio.
- `process-event`: xu ly `reservation.created`/`reservation.updated`, tao/gui notification job xac nhan dat phong, nhac check-in va direct check-in.
- `check-in/run`: quet reservation sap check-in, gui nhac check-in/direct check-in, ghi trang thai da gui.

### Checkout automation

```txt
POST /api/v1/internal/automation/check-outs/process-event
```

Muc dich:
- Nhan su kien check-out thanh cong.
- Tao cleaning task gan voi room/facility.
- Thong bao Quan ly ve sinh/nhom don dep.
- Len lich nhac cong no sau check-out neu con outstanding amount.

### Payment automation

```txt
POST /api/v1/internal/automation/payments/reminders/run
POST /api/v1/internal/automation/payments/process-completed
```

Muc dich:
- `reminders/run`: quet cong no den han, gui email/SMS nhac thanh toan, retry va ghi log.
- `process-completed`: dung lich nhac con lai khi thanh toan du, tao/gui bien nhan PDF neu can.

### Report automation

```txt
GET  /api/v1/internal/automation/reports/daily/stay-movements?date=YYYY-MM-DD
GET  /api/v1/internal/automation/reports/daily/occupancy?date=YYYY-MM-DD
GET  /api/v1/internal/automation/reports/daily/overdue-payments?date=YYYY-MM-DD
POST /api/v1/internal/automation/reports/daily/send
```

Muc dich:
- `stay-movements`: tra ve danh sach check-in/check-out trong ngay.
- `occupancy`: tra ve ty le lap day, tong so phong, so phong trong.
- `overdue-payments`: tra ve danh sach va tong cong no qua han.
- Tong hop occupancy, check-in/check-out, doanh thu, cong no, task don dep, su co automation.
- Gui bao cao cho Quan ly/Admin qua email/kenh noi bo.
- Ghi log ket qua gui bao cao.

## Payload su kien de backend phat sang n8n

### Reservation created/updated

```json
{
  "eventId": "evt_20260506_0001",
  "eventType": "reservation.created",
  "idempotencyKey": "reservation.created:123:1",
  "occurredAt": "2026-05-06T10:00:00+07:00",
  "reservationId": 123
}
```

### Checkout completed

```json
{
  "eventId": "evt_20260506_0002",
  "eventType": "checkout.completed",
  "idempotencyKey": "checkout.completed:123",
  "occurredAt": "2026-05-06T11:30:00+07:00",
  "reservationId": 123,
  "roomId": 45,
  "facilityId": 1
}
```

### Payment completed

```json
{
  "eventId": "evt_20260506_0003",
  "eventType": "payment.completed",
  "idempotencyKey": "payment.completed:987",
  "occurredAt": "2026-05-06T14:20:00+07:00",
  "reservationId": 123,
  "invoiceId": 987,
  "paymentId": 654
}
```
