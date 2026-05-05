# Hotel Management Frontend — Agent Guide

> File này dành cho **mọi AI coding agent** (Claude Code, Cursor, Windsurf, Cline, Aider, Codex CLI...) khi làm việc trong `hotel-management-fe/`.
>
> Đây là target frontend của một dự án migration từ **React (tiếng Nhật, JP-specific)** → **React 18 + Vite + TanStack Router/Query + shadcn/ui + Biome (tiếng Việt)**.

---

## 1. Đọc trước khi code

1. `../AGENT.md` (hoặc `../CLAUDE.md`) — workflow tổng và golden rules (đặc biệt mục **"Exact Copy" mode** liệt kê các JP feature phải xoá).
2. Skill phù hợp trong `../.agents/skills/`:
   - `migrate-frontend-page` — convert page Nhật sang target structure
   - `translate-japanese-ui` — dịch text Nhật sót sang Việt (`vi.json`)
   - `debug-migration` — bug shape API / missed translation
   - `fix-issue` — logic crash / sai requirement
   - `create-crud-page` — feature mới hoàn toàn

**Tuyệt đối KHÔNG copy 1:1 source Nhật.** Phải loại bỏ JP-specific (kana, wareki, kuromoji, zipcloud) — chi tiết trong `../AGENT.md` §"Exact Copy".

---

## 2. Stack nhanh

React 18 · TypeScript 5 strict · Vite 6 (SWC) · TanStack Router (file-based) · TanStack Query v5 · react-hook-form + Zod · shadcn/ui + Tailwind · **Biome** (KHÔNG ESLint) · i18next (`vi.json`) · Axios · **pnpm** (KHÔNG npm/yarn).

---

## 3. Quy ước cốt lõi (chi tiết xem skill tương ứng)

- **Path alias**: `@/*` → `src/*`. Luôn dùng, KHÔNG `from 'src/...'`.
- **Cấu trúc**: `api/{feature}.api.ts` · `hooks/queries/useGet*` · `hooks/mutations/useCreate*` · `routes/_authenticated/...` · `types/{feature}.ts` · `i18n/locales/vi.json`.
- **Route**: file-based, param **camelCase** (`$clientId`, KHÔNG `$client_id`); list dùng plural; multi-page → nested folder `{feature}/index.lazy.tsx`, `{feature}/$id/detail.lazy.tsx`...
- **Form**: `react-hook-form` + `zodResolver`, validation message qua `i18n.t(...)`.
- **i18n optional (hiện tại hardcode để dễ fix)**: KHÔNG hardcode user-facing string. Trong component dùng `useTranslation()`, ngoài component dùng `i18n.t(...)`.
- **shadcn**: chỉ dùng, KHÔNG sửa file trong `src/components/ui/`.
- **React Query v5**: KHÔNG `onSuccess`/`onError` trong `useQuery` — đã bị remove.

---

## 4. Biome rules (auto-fix qua `pnpm check`)

2 spaces · single quote · KHÔNG semicolon · trailing comma ES5 · line width 100 · `import type` cho type-only.

---

## 5. DO NOT

1. KHÔNG npm/yarn — chỉ pnpm.
2. KHÔNG ESLint — dùng Biome.
3. KHÔNG semicolon, KHÔNG double quote.
4. KHÔNG `console.log` trong production.
5. KHÔNG `any` không lý do, KHÔNG `as unknown as Type`.
6. KHÔNG bỏ Zod validation cho form.
7. KHÔNG sửa `src/components/ui/`.
8. KHÔNG `from 'src/...'` — dùng `@/`.
9. KHÔNG `onSuccess`/`onError` trong `useQuery`.

---

## 6. Trước khi báo "xong"

```bash
pnpm check          # Biome lint + format
pnpm type-check     # TS no emit
pnpm build          # BẮT BUỘC exit code 0
```

Nếu có **bất kỳ** lỗi nào → tự fix đến khi xanh, không được để lại code lỗi build.
