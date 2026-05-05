# Hotel Management Backend — Agent Guide

> File này dành cho **mọi AI coding agent** (Claude Code, Cursor, Windsurf, Cline, Aider, Codex CLI...) khi làm việc trong `hotel-management-be/`.
>
> Đây là target backend của một dự án migration từ **PHP/Laravel + MySQL** → **NestJS 11 + Prisma 7 + PostgreSQL**.

---

## 1. Đọc trước khi code

1. `../AGENT.md` (hoặc `../CLAUDE.md`) — workflow tổng và golden rules.
2. Skill phù hợp trong `../.agents/skills/`:
   - `analyze-php-source` — đọc SQL dump + PHP source
   - `convert-mysql-schema` — MySQL → Prisma PostgreSQL
   - `migrate-php-to-nestjs` — PHP logic → NestJS clean
   - `debug-migration` — bug shape API
   - `fix-issue` — logic crash / sai requirement

**Tuyệt đối KHÔNG dịch 1:1 PHP → TS.** Nếu source rối hoặc thiếu → hỏi user.

---

## 2. Stack nhanh

NestJS 11 · TypeScript 5 strict · Prisma 7 · PostgreSQL · JWT (Passport) · Swagger · Jest · ESLint + Prettier · Pino · **pnpm** (KHÔNG npm/yarn) · API prefix `/api/v1/`.

---

## 3. Quy ước cốt lõi (chi tiết xem skill tương ứng)

- **Path alias**: `@/*`, `@common/*`, `@config/*`, `@database/*`, `@modules/*`. KHÔNG relative cross-module.
- **Module skeleton**: `controller / service / repository (optional) / dto/{create,update,filter,response}.dto.ts + dto/index.ts (barrel)`.
- **Prisma**: PK = `{model}Id`, model PascalCase, table snake_case plural, mọi model có audit (`createdStaffId`, `updatedStaffId`, `deletedStaffId`, `createdAt`, `updatedAt`, `deletedAt`, `dataStatus`).
- **Soft delete only** — luôn filter `deletedAt: null`.
- **Response DTO** — luôn có `static fromEntity()`. KHÔNG trả Prisma model thẳng.
- **Swagger + validation decorator** — bắt buộc trên controller và DTO.
- **Auth** — `@UseGuards(AuthGuard('jwt'), RolesGuard)` + `@Roles(...)` + `@CurrentUser()`.
- **Error** — dùng `NestJS HttpException` (`NotFoundException`, `ConflictException`...). KHÔNG `throw new Error()`.

---

## 4. DO NOT

1. KHÔNG npm/yarn — chỉ pnpm.
2. KHÔNG relative-import cross-module.
3. KHÔNG hard delete.
4. KHÔNG magic number — dùng Enum/Constant.
5. KHÔNG bỏ Swagger / validation decorator.
6. KHÔNG `console.log` — dùng Logger.
7. KHÔNG `throw new Error()`.
8. KHÔNG trả Prisma model — luôn map qua Response DTO.
9. KHÔNG `any` không lý do, KHÔNG `@ts-ignore`, KHÔNG `as unknown as Type`.
10. KHÔNG quên `dto/index.ts`.
11. KHÔNG quên register module trong `app.module.ts`.

---

## 5. Trước khi báo "xong"

```bash
pnpm run build      # BẮT BUỘC exit code 0
```

Nếu build fail → tự phân tích lỗi và fix 
