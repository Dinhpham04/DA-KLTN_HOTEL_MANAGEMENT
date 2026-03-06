# GitHub Copilot Instructions — hotel-management-be

> Refer to `../.cursorrules` for the full, detailed coding rules.
> This file provides the same rules in a format optimized for GitHub Copilot.

## Tech Stack

- NestJS 11 + TypeScript 5.x (strict: true)
- Prisma 7 with PostgreSQL (driver adapter pattern)
- JWT authentication (access + refresh tokens)
- pnpm package manager (NOT npm, NOT yarn)
- Module resolution: `commonjs` / `node` (standard NestJS)

## Critical Import Rules

1. **Cross-module imports**: Use path aliases `@common/*`, `@config/*`, `@database/*`, `@modules/*`
2. **Intra-module imports**: Use relative paths (no `.js` extension needed)
3. **Prisma client**: Import from `@prisma/client`
4. **Barrel exports**: Every directory must have `index.ts` re-exporting all public symbols
5. **Env vars**: Access via `process.env['VAR_NAME']` (bracket notation, not dot)

## Import Order

```typescript
// 1. NestJS
import { Injectable } from '@nestjs/common';
// 2. Third-party
import * as bcrypt from 'bcrypt';
// 3. Internal aliases
import { PrismaService } from '@database/prisma.service';
// 4. Local
import { CreateRoomDto } from './dto/create-room.dto';
```

## Module Structure

Every feature module at `src/modules/<feature>/` must have:
- `<feature>.module.ts` — registered in `app.module.ts`
- `<feature>.service.ts` — business logic, injects `PrismaService`
- `<feature>.controller.ts` — with `@ApiTags`, `@ApiOperation`, `@Controller`
- `dto/` — with Create, Update, Response DTOs + `index.ts`
- `*.spec.ts` — unit tests alongside source files

## Prisma Schema

- Model names: PascalCase singular (`Room`, `RoomClass`)
- Fields: camelCase with `@map("snake_case")`
- Tables: `@@map("snake_case_plural")`
- All models must have: `dataStatus`, `createdAt`, `updatedAt`, `deletedAt`, audit staff IDs
- ALWAYS soft delete (`deletedAt`), NEVER hard delete
- After schema changes: `pnpm prisma:generate` then `pnpm prisma:migrate`

## Code Style

- Prettier: singleQuote, trailingComma: all, printWidth: 100, semi: true, endOfLine: lf
- Naming: Files=kebab-case, Classes=PascalCase, methods=camelCase, constants=UPPER_SNAKE
- DTOs: class-validator decorators + @nestjs/swagger decorators required
- Errors: Use NestJS HttpException subclasses, not plain `Error`
- Logging: Use NestJS `Logger`, not `console.log`

## Git Commits

Conventional Commits format: `<type>(<scope>): <subject>`
Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

## Verification

After ANY code change, run `pnpm run build` and ensure 0 errors before reporting done.
