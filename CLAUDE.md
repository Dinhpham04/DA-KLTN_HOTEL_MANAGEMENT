# Hotel Management - Master Migration Workflow

This project is a massive migration from a legacy system (PHP/Laravel + Japanese React) to a modern architecture (NestJS/Prisma + Vietnamese React).

## Directory Structure
- `hotel-management-be/`: Target backend. **CRITICAL**: Read `hotel-management-be/CLAUDE.md` for strict NestJS conventions before writing code.
- `hotel-management-fe/`: Target frontend. **CRITICAL**: Read `hotel-management-fe/CLAUDE.md` for strict React/Biome conventions before writing code.
- `docs/`: Contains `hotel_management_sql_create.sql` (MySQL DB Dump of the legacy system).
- `.agents/skills/`: Custom instructions/skills for the AI Agent to perform migrations accurately.

---

## 🚀 The Migration Workflow (Agent Instructions)

As an AI Agent (Claude Code, Cursor, Windsurf, etc), **DO NOT** attempt to guess the migration or write code from scratch. You **MUST** use the predefined skills in `.agents/skills/` sequentially for every feature migration.

### 5-Step Core Migration Cycle
When tasked to migrate a feature (e.g., Facility, Area, Reserve), follow this exact order:

1. **`analyze-php-source`**: Start here. Read the SQL dump (`docs/hotel_management_sql_create.sql`) and legacy PHP models/controllers to understand the original database schema and business logic.
2. **`convert-mysql-schema`**: Convert the analyzed MySQL schema into a PostgreSQL-optimized Prisma model in `hotel-management-be/prisma/schema.prisma`. Ensure audit fields and soft-delete conventions are applied.
3. **`migrate-php-to-nestjs`**: Refactor the backend logic into strict, clean TypeScript for NestJS. This is not a 1:1 translation; optimize for performance (avoid N+1) and leverage Dependency Injection.
4. **`migrate-frontend-page`**: Convert the corresponding Japanese frontend page into the new target frontend structure. Keep the UI style identical but refactor the code (extract hooks, split large components, clean up dead code).
5. **`translate-japanese-ui`**: Use this to hunt down and translate any remaining Japanese text into Vietnamese (`vi.json`) in the frontend.

### Additional Helper Skills
- **`create-crud-page`**: Use when asked to build a completely NEW feature (not migrating existing one).
- **`debug-migration`**: Use when fixing bugs specifically related to PHP/NestJS migration (API shape differences or missed translations).
- **`fix-issue`**: Use when output behavior is incorrect, the logic crashes, or the implementation doesn't match the user's requirements. This skill enforces tracing the data flow to find the true root cause instead of hallucinating workarounds.

---

## Agent Golden Rules
1. **Always use specific skills:** If the user says "Translate the Staff page", read `/translate-japanese-ui/SKILL.md` before touching the code.
2. **Read the sub-CLAUDE.md files:** The backend (`hotel-management-be/CLAUDE.md`) and frontend (`hotel-management-fe/CLAUDE.md`) have very strict linting, formatting (Biome), and architectural rules. Obey them.
3. **If unsure, Ask:** The source logic can be messy. If a PHP endpoint is overly complex and you're unsure how to optimize it for NestJS, use the `notify_user` tool or ask for clarification.
