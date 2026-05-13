# Hotel Assistant Chatbot - n8n Workflow

TÃ i liá»‡u nÃ y mÃ´ táº£ workflow n8n cho chatbot AI nhÃºng trong frontend khÃ¡ch sáº¡n.

Má»¥c tiÃªu:
- Widget React chá»‰ gá»­i má»™t request tá»›i chatbot workflow.
- n8n phÃ¢n tÃ­ch cÃ¢u há»i, chá»n tool/API cáº§n gá»i, láº¥y context báº±ng cÃ¡c API read-only.
- Node AI thá»© hai tá»•ng há»£p context thÃ nh cÃ¢u tráº£ lá»i cuá»‘i cÃ¹ng.
- KhÃ´ng gá»i API ghi dá»¯ liá»‡u: khÃ´ng `POST`, `PUT`, `PATCH`, `DELETE` tá»›i nghiá»‡p vá»¥ khÃ¡ch sáº¡n.
- TÃ i liá»‡u ná»™i bá»™/quy trÃ¬nh cÃ³ thá»ƒ láº¥y tá»« Google Drive hoáº·c vector store.

---

## 1. Frontend Contract

Widget gá»i n8n webhook:

```http
POST /webhook/hotel-assistant/chat
Content-Type: application/json
Authorization: Bearer <optional-user-token>
```

Body:

```json
{
  "message": "TÃ³m táº¯t Ä‘Æ¡n nÃ y giÃºp tÃ´i",
  "sessionId": "browser-session-id",
  "staffId": 12,
  "facilityId": 1,
  "pageContext": {
    "route": "/reservations/123/edit",
    "screen": "reservation_edit",
    "reserveId": 123,
    "clientId": 45,
    "roomId": 502
  }
}
```

Ghi chÃº:
- `reserveId`, `clientId`, `roomId` chá»‰ lÃ  hint tá»« frontend.
- n8n/backend váº«n pháº£i kiá»ƒm tra láº¡i báº±ng API read-only.
- Náº¿u user Ä‘ang á»Ÿ mÃ n hÃ¬nh chá»‰nh sá»­a/detail booking, luÃ´n gá»­i `reserveId` Ä‘á»ƒ AI hiá»ƒu cÃ¡c cÃ¢u nhÆ° "Ä‘Æ¡n nÃ y", "khÃ¡ch nÃ y", "thanh toÃ¡n booking nÃ y".

Response:

```json
{
  "answer": "Markdown answer",
  "cards": [
    {
      "type": "reservation",
      "title": "BK-240518 - Nguyá»…n Minh Anh",
      "subtitle": "Check-in hÃ´m nay lÃºc 14:00",
      "description": "ÄÃ£ xÃ¡c nháº­n, cÃ²n thiáº¿u 2.600.000Ä‘.",
      "fields": [
        { "label": "PhÃ²ng", "value": "502 Deluxe" },
        { "label": "Thanh toÃ¡n", "value": "CÃ²n 2.600.000Ä‘", "tone": "warning" }
      ]
    }
  ],
  "actions": [
    {
      "type": "link",
      "label": "Má»Ÿ booking",
      "href": "/reservations/123/detail"
    }
  ],
  "meta": {
    "intent": "reservation_summary",
    "confidence": 0.91,
    "calledTools": ["get_reservation_detail", "get_payment_status"],
    "sources": [
      { "type": "api", "name": "GET /reservations/123" }
    ]
  }
}
```

KhÃ´ng tráº£ HTML tá»« AI. DÃ¹ng Markdown cho `answer` vÃ  JSON generic cho `cards/actions`.

---

## 2. Environment Variables / Credentials

Workflow JSON hiá»‡n Ä‘Ã£ hard-code backend URL vÃ  internal token trong cÃ¡c tool workflow Ä‘á»ƒ khÃ´ng phá»¥ thuá»™c `.env`:

```txt
backendBaseUrl = http://host.docker.internal:3000/api/v1
internalToken  = dev-internal-token
```

Náº¿u mÃ´i trÆ°á»ng khÃ¡c, search hai chuá»—i trÃªn trong `docs/n8n/hotel-assistant-tools/*.workflow.json` vÃ  thay láº¡i.

Credentials váº«n cáº§n cáº¥u hÃ¬nh trong n8n UI:

```txt
OpenRouter account
Postgres account
```

Header khi n8n gá»i backend:

```http
x-internal-token: dev-internal-token
```

Trong file JSON Ä‘Ã£ xuáº¥t, header nÃ y Ä‘ang dÃ¹ng giÃ¡ trá»‹ hard-code:

```txt
x-internal-token: dev-internal-token
```

KhÃ´ng Ä‘Æ°a internal token xuá»‘ng frontend.

---

## 3. Main Workflow Nodes

TÃªn workflow: `Hotel Assistant - Chatbot Main`

### Node 1: Webhook

Node: `Webhook`

Config:
- HTTP Method: `POST`
- Path: `hotel-assistant/chat`
- Response mode: `Using Respond to Webhook node`

Output Ä‘áº§u vÃ o máº«u:

```json
{
  "body": {
    "message": "...",
    "sessionId": "...",
    "staffId": 12,
    "facilityId": 1,
    "pageContext": {}
  }
}
```

### Node 2: Normalize Input

Node: `Code`

Má»¥c tiÃªu:
- Validate message.
- Táº¡o `sessionKey`.
- Gáº¯n ngÃ y hiá»‡n táº¡i theo timezone Viá»‡t Nam.
- Chuáº©n hÃ³a page context.

Code:

```js
const body = $json.body ?? $json

const message = String(body.message ?? '').trim()
if (!message) {
  return [
    {
      json: {
        error: 'EMPTY_MESSAGE',
        answer: 'Vui lÃ²ng nháº­p ná»™i dung cáº§n tra cá»©u.',
        cards: [],
        actions: [],
        meta: { intent: 'invalid', confidence: 1, calledTools: [] },
      },
    },
  ]
}

const staffId = body.staffId ?? 'anonymous'
const facilityId = body.facilityId ?? 'default'
const sessionId = body.sessionId ?? `${staffId}-${Date.now()}`
const sessionKey = `hotel-assistant:${facilityId}:${staffId}:${sessionId}`

const now = new Date()
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(now)

return [
  {
    json: {
      message,
      sessionId,
      sessionKey,
      staffId,
      facilityId,
      today,
      timezone: 'Asia/Ho_Chi_Minh',
      pageContext: body.pageContext ?? {},
      guardrails: {
        mode: 'read_only',
        allowedMethods: ['GET'],
        deniedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      },
    },
  },
]
```

### Node 3: Has Validation Error?

Node: `IF`

Condition:

```txt
{{$json.error}} exists
```

Náº¿u true: Ä‘i tháº³ng tá»›i `Respond to Webhook`.

Náº¿u false: Ä‘i tá»›i Planner AI.

### Node 4: Planner AI

Node: `AI Agent`

Kiá»ƒu agent:
- `Tools Agent`

Connected sub-nodes:
- Chat Model: `OpenAI Chat Model` node cấu hình OpenRouter-compatible credential.
- Memory: `Postgres Chat Memory`.
- Tools: cÃ¡c `Call n8n Workflow Tool` á»Ÿ má»¥c 4.

Postgres Chat Memory:
- Session Key: `{{$json.sessionKey}}`
- Context Window Length: `8`

System prompt:

```txt
Báº¡n lÃ  AI planner cho chatbot trá»£ lÃ½ nghiá»‡p vá»¥ khÃ¡ch sáº¡n.

Nhiá»‡m vá»¥ cá»§a báº¡n:
1. PhÃ¢n tÃ­ch cÃ¢u há»i tiáº¿ng Viá»‡t cá»§a nhÃ¢n viÃªn khÃ¡ch sáº¡n.
2. XÃ¡c Ä‘á»‹nh intent vÃ  entity.
3. Gá»i cÃ¡c tool read-only cáº§n thiáº¿t Ä‘á»ƒ láº¥y context.
4. KhÃ´ng tráº£ lá»i cuá»‘i cÃ¹ng cho ngÆ°á»i dÃ¹ng.
5. Chá»‰ tráº£ vá» JSON theo schema bÃªn dÆ°á»›i.

Quy táº¯c báº¯t buá»™c:
- Chá»‰ Ä‘Æ°á»£c dÃ¹ng tool read-only.
- KhÃ´ng gá»i, Ä‘á» xuáº¥t hoáº·c giáº£ láº­p thao tÃ¡c ghi dá»¯ liá»‡u.
- Náº¿u ngÆ°á»i dÃ¹ng yÃªu cáº§u check-in, check-out, há»§y booking, cáº­p nháº­t thanh toÃ¡n, sá»­a phÃ²ng, hÃ£y Ä‘áº·t intent lÃ  "forbidden_write_action".
- KhÃ´ng tá»± bá»‹a dá»¯ liá»‡u. Náº¿u thiáº¿u dá»¯ liá»‡u, ghi vÃ o warnings.
- Náº¿u pageContext cÃ³ reserveId vÃ  cÃ¢u há»i cÃ³ "Ä‘Æ¡n nÃ y", "booking nÃ y", "khÃ¡ch nÃ y", Æ°u tiÃªn reserveId Ä‘Ã³.

Context há»‡ thá»‘ng:
- today: {{$json.today}}
- timezone: {{$json.timezone}}
- facilityId: {{$json.facilityId}}
- pageContext: {{JSON.stringify($json.pageContext)}}

Output JSON schema:
{
  "intent": "string",
  "confidence": 0.0,
  "entities": {
    "reserveId": "number|null",
    "bookingCode": "string|null",
    "guestName": "string|null",
    "clientId": "number|null",
    "roomId": "number|null",
    "roomNo": "string|null",
    "roomType": "string|null",
    "date": "YYYY-MM-DD|null",
    "from": "YYYY-MM-DD|null",
    "to": "YYYY-MM-DD|null"
  },
  "calledTools": ["string"],
  "toolContext": {
    "reservations": [],
    "rooms": [],
    "payments": [],
    "occupiers": [],
    "clients": [],
    "documents": []
  },
  "warnings": ["string"]
}
```

User prompt:

```txt
Tin nháº¯n cá»§a nhÃ¢n viÃªn:
{{$json.message}}
```

### Node 5: Parse Planner Output

Node: `Code`

Má»¥c tiÃªu:
- Parse JSON tá»« Planner.
- Náº¿u Planner tráº£ lá»—i hoáº·c text khÃ´ng parse Ä‘Æ°á»£c, fallback context rá»—ng.
- KhÃ´ng lÃ m máº¥t original input.

Code:

```js
const original = $('Normalize Input').first().json
const raw = $json.output ?? $json.text ?? $json

function tryParse(value) {
  if (typeof value === 'object') return value
  const text = String(value ?? '').trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

const parsed = tryParse(raw)

return [
  {
    json: {
      ...original,
      planner: parsed ?? {
        intent: 'unknown',
        confidence: 0,
        entities: {},
        calledTools: [],
        toolContext: {},
        warnings: ['KhÃ´ng parse Ä‘Æ°á»£c káº¿t quáº£ planner.'],
      },
    },
  },
]
```

### Node 6: Answer Composer AI

Node: `Basic LLM Chain` hoáº·c `AI Agent` khÃ´ng tool.

KhÃ´ng gáº¯n tool vÃ o node nÃ y.

System prompt:

```txt
Báº¡n lÃ  trá»£ lÃ½ AI cho nhÃ¢n viÃªn khÃ¡ch sáº¡n.

Báº¡n nháº­n context Ä‘Ã£ Ä‘Æ°á»£c láº¥y tá»« cÃ¡c API read-only vÃ  tÃ i liá»‡u ná»™i bá»™.
HÃ£y viáº¿t cÃ¢u tráº£ lá»i cuá»‘i cÃ¹ng báº±ng tiáº¿ng Viá»‡t, ngáº¯n gá»n, rÃµ rÃ ng, há»¯u Ã­ch cho nghiá»‡p vá»¥ lá»… tÃ¢n/váº­n hÃ nh khÃ¡ch sáº¡n.

Quy táº¯c:
- Chá»‰ dÃ¹ng dá»¯ liá»‡u trong context.
- KhÃ´ng tá»± bá»‹a sá»‘ tiá»n, ngÃ y, tráº¡ng thÃ¡i, phÃ²ng, chÃ­nh sÃ¡ch.
- Náº¿u thiáº¿u dá»¯ liá»‡u, nÃ³i rÃµ cáº§n thÃªm thÃ´ng tin gÃ¬.
- Náº¿u intent lÃ  "forbidden_write_action", tráº£ lá»i ráº±ng báº¡n chá»‰ cÃ³ quyá»n tra cá»©u vÃ  khÃ´ng thá»ƒ thá»±c hiá»‡n thao tÃ¡c ghi dá»¯ liá»‡u.
- CÃ¢u tráº£ lá»i chÃ­nh dÃ¹ng Markdown.
- Äá»“ng thá»i tráº£ JSON theo schema:
{
  "answer": "markdown string",
  "cards": [
    {
      "type": "reservation|room|payment|guest|document|summary",
      "title": "string",
      "subtitle": "string",
      "description": "string",
      "fields": [
        { "label": "string", "value": "string", "tone": "default|success|warning|danger" }
      ]
    }
  ],
  "actions": [
    { "type": "link", "label": "string", "href": "string" }
  ],
  "meta": {
    "intent": "string",
    "confidence": 0.0,
    "calledTools": ["string"],
    "sources": [
      { "type": "api|drive|memory", "name": "string" }
    ]
  }
}
```

User prompt:

```txt
Tin nháº¯n gá»‘c:
{{$json.message}}

Planner result:
{{JSON.stringify($json.planner)}}

Page context:
{{JSON.stringify($json.pageContext)}}
```

### Node 7: Normalize Response

Node: `Code`

Code:

```js
const raw = $json.output ?? $json.text ?? $json

function tryParse(value) {
  if (typeof value === 'object') return value
  const text = String(value ?? '').trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      answer: text || 'TÃ´i chÆ°a thá»ƒ táº¡o cÃ¢u tráº£ lá»i tá»« dá»¯ liá»‡u hiá»‡n cÃ³.',
      cards: [],
      actions: [],
      meta: { intent: 'unknown', confidence: 0, calledTools: [], sources: [] },
    }
  }
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return {
      answer: text,
      cards: [],
      actions: [],
      meta: { intent: 'unknown', confidence: 0, calledTools: [], sources: [] },
    }
  }
}

const response = tryParse(raw)

return [
  {
    json: {
      answer: response.answer ?? 'KhÃ´ng cÃ³ cÃ¢u tráº£ lá»i.',
      cards: Array.isArray(response.cards) ? response.cards : [],
      actions: Array.isArray(response.actions) ? response.actions : [],
      meta: {
        intent: response.meta?.intent ?? 'unknown',
        confidence: response.meta?.confidence ?? 0,
        calledTools: response.meta?.calledTools ?? [],
        sources: response.meta?.sources ?? [],
      },
    },
  },
]
```

### Node 8: Respond to Webhook

Node: `Respond to Webhook`

Response body:

```json
={{$json}}
```

Status code:

```txt
200
```

---

## 4. Tool Workflows

Má»—i tool nÃªn lÃ  má»™t workflow riÃªng Ä‘á»ƒ kiá»ƒm soÃ¡t cháº·t URL, method vÃ  output.

Táº¥t cáº£ tool:
- Trigger báº±ng `When Executed by Another Workflow`.
- Chá»‰ dÃ¹ng `HTTP Request` method `GET`.
- KhÃ´ng nháº­n full URL tá»« AI.
- Validate input báº±ng `Code` trÆ°á»›c khi gá»i API.
- Normalize output báº±ng `Code` sau khi gá»i API.

### Tool 1: search_reservations

Má»¥c tiÃªu:
- TÃ¬m booking theo mÃ£ booking, tÃªn khÃ¡ch, ngÃ y, clientId.

Input:

```json
{
  "bookingCode": "BK-240518",
  "guestName": "Nguyá»…n Minh Anh",
  "clientId": 45,
  "date": "2026-05-12",
  "facilityId": 1,
  "limit": 5
}
```

HTTP Request:

```http
GET http://host.docker.internal:3000/api/v1/reservations
x-internal-token: dev-internal-token
```

Query params:

```txt
search={{$json.bookingCode}}
clientName={{$json.guestName}}
occupierName={{$json.guestName}}
clientId={{$json.clientId}}
periodFrom={{$json.date}}
periodTo={{$json.date}}
facilityId={{$json.facilityId}}
limit={{$json.limit ?? 5}}
```

Output normalized:

```json
{
  "reservations": [
    {
      "reserveId": 123,
      "bookingCode": "BK-240518",
      "guestName": "Nguyá»…n Minh Anh",
      "checkIn": "2026-05-12",
      "checkOut": "2026-05-15",
      "roomNo": "502",
      "status": "confirmed"
    }
  ],
  "sources": [{ "type": "api", "name": "GET /reservations" }]
}
```

### Tool 2: get_reservation_detail

Input:

```json
{ "reserveId": 123 }
```

HTTP:

```http
GET http://host.docker.internal:3000/api/v1/reservations/{{$json.reserveId}}
```

Output:

```json
{
  "reservation": {
    "reserveId": 123,
    "bookingCode": "BK-240518",
    "guestName": "Nguyá»…n Minh Anh",
    "clientName": "ABC Travel",
    "checkIn": "2026-05-12",
    "checkOut": "2026-05-15",
    "roomNo": "502",
    "roomType": "Deluxe",
    "status": "confirmed",
    "notes": []
  },
  "sources": [{ "type": "api", "name": "GET /reservations/:id" }]
}
```

### Tool 3: get_today_checkin_checkout

Input:

```json
{
  "date": "2026-05-12",
  "mode": "checkin|checkout|both",
  "facilityId": 1
}
```

HTTP:

```http
GET http://host.docker.internal:3000/api/v1/daily-reserve
```

Query:

```txt
date={{$json.date}}
facilityId={{$json.facilityId}}
```

Output:

```json
{
  "checkins": [],
  "checkouts": [],
  "sources": [{ "type": "api", "name": "GET /daily-reserve" }]
}
```

### Tool 4: get_payment_status

Input:

```json
{ "reserveId": 123 }
```

Nodes:
1. `HTTP Request - Request Details`

```http
GET http://host.docker.internal:3000/api/v1/request-details?reserveId={{$json.reserveId}}
```

2. `HTTP Request - Sale Details`

```http
GET http://host.docker.internal:3000/api/v1/sale-details?reserveId={{$json.reserveId}}
```

3. `Code - Calculate Payment`

```js
const requestDetails = $('HTTP Request - Request Details').first().json.data ?? []
const saleDetails = $('HTTP Request - Sale Details').first().json.data ?? []

const totalInvoice = requestDetails.reduce((sum, item) => {
  const unitPrice = Number(item.unitPrice ?? item.unit_price ?? 0)
  const count = Number(item.count ?? 1)
  return sum + unitPrice * count
}, 0)

const totalPaid = saleDetails.reduce((sum, item) => {
  return sum + Number(item.totalPrice ?? item.total_price ?? 0)
}, 0)

return [
  {
    json: {
      payment: {
        totalInvoice,
        totalPaid,
        remaining: totalInvoice - totalPaid,
        status:
          totalPaid >= totalInvoice
            ? 'paid'
            : totalPaid > 0
              ? 'partial'
              : 'unpaid',
      },
      requestDetails,
      saleDetails,
      sources: [
        { type: 'api', name: 'GET /request-details' },
        { type: 'api', name: 'GET /sale-details' },
      ],
    },
  },
]
```

### Tool 5: search_rooms

Input:

```json
{
  "roomNo": "502",
  "roomType": "Deluxe",
  "status": "available|occupied|cleaning|maintenance",
  "facilityId": 1
}
```

HTTP:

```http
GET http://host.docker.internal:3000/api/v1/rooms
```

Output:

```json
{
  "rooms": [],
  "sources": [{ "type": "api", "name": "GET /rooms" }]
}
```

### Tool 6: search_available_rooms

Khuyáº¿n nghá»‹ backend táº¡o endpoint read-only riÃªng:

```http
GET /rooms?periodFrom=&periodTo=&roomTypeId=&facilityId=
```

Náº¿u chÆ°a cÃ³ endpoint nÃ y, workflow cÃ³ thá»ƒ táº¡m gá»i:
- `GET /rooms`
- `GET /rooms?periodFrom=&periodTo=&roomTypeId=`
- Code node tá»± loáº¡i phÃ²ng Ä‘Ã£ cÃ³ booking.

Output:

```json
{
  "availableRooms": [
    {
      "roomId": 502,
      "roomNo": "502",
      "roomType": "Deluxe",
      "cleaningStatus": "ready"
    }
  ],
  "sources": [
    { "type": "api", "name": "GET /rooms" },
    { "type": "api", "name": "GET /reservations" }
  ]
}
```

### Tool 7: get_guest_history

Input:

```json
{
  "guestName": "Nguyá»…n Minh Anh",
  "clientId": 45
}
```

Nodes:
- `GET /clients?search=...`
- `GET /reservations?clientId=...` hoáº·c `GET /reservations?clientName=&occupierName=...`

Output:

```json
{
  "guest": {
    "clientId": 45,
    "name": "Nguyá»…n Minh Anh"
  },
  "history": [],
  "sources": [
    { "type": "api", "name": "GET /clients" },
    { "type": "api", "name": "GET /reservations" }
  ]
}
```

### Tool 8: search_internal_docs

CÃ³ 2 mode.

#### Mode A: Google Drive trá»±c tiáº¿p

Nodes:
- `Google Drive - Search Files`
- `Google Drive - Download/Export`
- `Code - Trim Text`

Input:

```json
{
  "query": "quy trÃ¬nh khÃ¡ch Ä‘áº¿n sá»›m",
  "folderId": "{{$env.GOOGLE_DRIVE_POLICY_FOLDER_ID}}",
  "limit": 3
}
```

Output:

```json
{
  "documents": [
    {
      "title": "Quy trÃ¬nh lá»… tÃ¢n",
      "snippet": "KhÃ¡ch Ä‘áº¿n sá»›m trÆ°á»›c 9:00...",
      "url": "https://drive.google.com/..."
    }
  ],
  "sources": [{ "type": "drive", "name": "Google Drive policy folder" }]
}
```

#### Mode B: Vector Store

Production nÃªn dÃ¹ng:
- Cron/Drive Trigger Ä‘á»c file.
- Chia chunk.
- Táº¡o embeddings.
- LÆ°u Postgres pgvector/Qdrant/Supabase Vector.
- Tool `search_internal_docs` chá»‰ query vector store.

---

## 5. Planner Tool Descriptions

Khi gáº¯n `Call n8n Workflow Tool`, Ä‘áº·t description rÃµ:

### search_reservations

```txt
Read-only tool. Search reservations by booking code, guest name, client ID, date, or facility.
Use this when the user asks to find booking, search guest booking, or list reservations.
Never modifies data.
```

### get_reservation_detail

```txt
Read-only tool. Get one reservation detail by reserveId.
Use this when pageContext.reserveId exists or when the user asks about "Ä‘Æ¡n nÃ y", "booking nÃ y", "khÃ¡ch nÃ y".
Never modifies data.
```

### get_payment_status

```txt
Read-only tool. Get billing/payment status for a reserveId using request details and sale details.
Use this for payment status, debt, paid amount, remaining amount.
Never modifies data.
```

### search_internal_docs

```txt
Read-only tool. Search hotel internal documents, policies, procedures, department phone extensions, and abnormal situation handling guides.
Never modifies data.
```

---

## 6. Memory Strategy

DÃ¹ng `Postgres Chat Memory` cho Planner AI.

Session key:

```txt
hotel-assistant:{facilityId}:{staffId}:{sessionId}
```

Context window:

```txt
8 messages
```

LÆ°u trong memory:
- CÃ¢u há»i/cÃ¢u tráº£ lá»i gáº§n nháº¥t.
- Entity gáº§n nháº¥t: `lastReserveId`, `lastGuestName`, `lastRoomNo`, `lastClientId`.
- KhÃ´ng lÆ°u raw API result lá»›n.

KhÃ´ng lÆ°u trong memory:
- Full danh sÃ¡ch booking dÃ i.
- Full ná»™i dung tÃ i liá»‡u ná»™i bá»™.
- Dá»¯ liá»‡u nháº¡y cáº£m khÃ´ng cáº§n thiáº¿t.

Náº¿u cáº§n lÆ°u durable state, thÃªm workflow/table riÃªng:

```json
{
  "sessionKey": "hotel-assistant:1:12:abc",
  "lastReserveId": 123,
  "lastClientId": 45,
  "lastGuestName": "Nguyá»…n Minh Anh",
  "lastRoomNo": "502",
  "lastIntent": "payment_status",
  "updatedAt": "2026-05-12T10:00:00+07:00"
}
```

---

## 7. Read-only Security

Má»©c báº£o máº­t Ä‘Æ¡n giáº£n báº±ng internal token:

1. n8n gá»i backend vá»›i:

```http
x-internal-token: dev-internal-token
```

2. Backend guard kiá»ƒm tra token á»Ÿ cÃ¡c endpoint `/internal/chatbot/*` hoáº·c cÃ¡c endpoint internal khÃ¡c.

3. AI khÃ´ng Ä‘Æ°á»£c truyá»n full URL.

4. Tool workflows hardcode:
- Method: `GET`
- Base URL: `hard-coded backendBaseUrl`
- Path: cá»‘ Ä‘á»‹nh

5. Náº¿u user yÃªu cáº§u ghi dá»¯ liá»‡u:

```txt
TÃ´i chá»‰ cÃ³ quyá»n tra cá»©u, khÃ´ng thá»ƒ thá»±c hiá»‡n thao tÃ¡c cáº­p nháº­t/há»§y/check-in/check-out. Báº¡n vui lÃ²ng thao tÃ¡c trÃªn mÃ n hÃ¬nh nghiá»‡p vá»¥ tÆ°Æ¡ng á»©ng.
```

---

## 8. Intent Routing Reference

| User asks | Intent | Tools |
|---|---|---|
| TÃ¬m booking BK-xxx | `booking_search` | `search_reservations`, optional `get_reservation_detail` |
| TÃ³m táº¯t Ä‘Æ¡n nÃ y | `reservation_summary` | `get_reservation_detail`, `get_payment_status`, `get_reserve_occupiers` |
| Check-in hÃ´m nay | `today_checkin` | `get_today_checkin_checkout` |
| Check-out hÃ´m nay | `today_checkout` | `get_today_checkin_checkout` |
| KhÃ¡ch nÃ y Ä‘Ã£ á»Ÿ máº¥y láº§n | `guest_history` | `get_guest_history` |
| ÄÆ¡n nÃ y thanh toÃ¡n chÆ°a | `payment_status` | `get_payment_status` |
| PhÃ²ng 502 tráº¡ng thÃ¡i gÃ¬ | `room_status` | `search_rooms` |
| PhÃ²ng Deluxe trá»‘ng ngÃ y mai | `available_rooms` | `search_available_rooms` |
| Quy trÃ¬nh khÃ¡ch Ä‘áº¿n sá»›m | `procedure_lookup` | `search_internal_docs` |
| Sá»‘ ná»™i bá»™ buá»“ng phÃ²ng | `policy_lookup` | `search_internal_docs` |
| Há»§y booking nÃ y | `forbidden_write_action` | none |

---

## 9. Recommended Backend Internal Endpoints

Náº¿u muá»‘n n8n Ä‘Æ¡n giáº£n vÃ  an toÃ n hÆ¡n, táº¡o nhÃ³m endpoint read-only riÃªng:

```txt
GET /internal/chatbot/reservations
GET /internal/chatbot/reservations/:reserveId
GET /internal/chatbot/reservations/:reserveId/payment
GET /internal/chatbot/reservations/:reserveId/occupiers
GET /internal/chatbot/daily-reserve
GET /internal/chatbot/rooms
GET /internal/chatbot/rooms/:roomId
GET /internal/chatbot/clients
GET /internal/chatbot/clients/:clientId/history
```

Æ¯u Ä‘iá»ƒm:
- n8n khÃ´ng pháº£i biáº¿t quÃ¡ nhiá»u shape API nghiá»‡p vá»¥.
- Backend cÃ³ thá»ƒ lá»c field nháº¡y cáº£m.
- Dá»… enforce read-only.
- Dá»… audit log riÃªng cho chatbot.

---

## 10. Minimal Implementation Order

1. Dá»±ng main workflow: Webhook -> Normalize -> Planner AI -> Composer AI -> Respond.
2. Táº¡o 3 tool trÆ°á»›c:
   - `get_reservation_detail`
   - `get_payment_status`
   - `search_internal_docs`
3. Frontend gá»­i `pageContext.reserveId`.
4. Test cÃ¢u:
   - "TÃ³m táº¯t Ä‘Æ¡n nÃ y"
   - "ÄÆ¡n nÃ y thanh toÃ¡n chÆ°a?"
   - "Quy trÃ¬nh khÃ¡ch Ä‘áº¿n sá»›m lÃ  gÃ¬?"
5. Sau Ä‘Ã³ thÃªm room/check-in/check-out/guest history tools.

