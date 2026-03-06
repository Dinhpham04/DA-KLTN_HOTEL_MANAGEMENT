# Project Conventions — hotel-management-be

> Tài liệu dành cho developer (người) và AI agent cùng tuân thủ.
> Chi tiết đầy đủ cho AI agent xem [.cursorrules](.cursorrules).

## Kiến trúc

```
src/
├── main.ts                 # Bootstrap, global pipes/filters/interceptors
├── app.module.ts           # Root module — đăng ký tất cả feature modules ở đây
├── common/                 # Shared: interfaces, guards, decorators, DTOs, enums, constants
├── config/                 # Env validation + config registration
├── database/               # PrismaService (global module)
└── modules/                # Feature modules — mỗi feature 1 subfolder
    ├── auth/               # JWT authentication
    ├── health/             # Health check endpoint
    └── <feature>/          # Thêm module mới ở đây
```

## Quick Reference

| Hạng mục        | Convention                                                    |
| ---------------- | ------------------------------------------------------------- |
| Package manager  | `pnpm`                                                        |
| Imports          | `@common/*`, `@database/*`, `@modules/*`                      |
| Import extension | Không cần `.js` extension (commonjs module resolution)          |
| Prisma client    | `import { PrismaClient } from '@prisma/client'`               |
| Soft delete      | `deletedAt` field, KHÔNG hard delete                          |
| API prefix       | `/api/v1/` (auto)                                             |
| Swagger          | `@ApiTags`, `@ApiOperation` trên mọi controller               |
| Validation       | `class-validator` decorators trong DTO classes                 |
| Error handling   | `NotFoundException`, `BadRequestException`, etc.              |
| Logging          | `Logger` từ `@nestjs/common`, KHÔNG `console.log`             |
| Tests            | `*.spec.ts` cùng thư mục với source file                      |
| Commits          | Conventional Commits: `feat(scope): message`                  |
| Build            | `pnpm run build` = `nest build && tsc-alias`                  |

## Khi tạo module mới

1. Schema → `prisma/schema.prisma`
2. Generate → `pnpm prisma:generate && pnpm prisma:migrate`
3. Module → `src/modules/<feature>/` (module, service, controller, dto/)
4. Register → thêm vào `app.module.ts`
5. Test → `*.spec.ts`
6. Verify → `pnpm run build` phải pass

## Scripts

```bash
pnpm run start:dev      # Dev server (watch)
pnpm run build          # Production build
pnpm run lint           # ESLint + auto fix
pnpm run format         # Prettier format
pnpm test               # Jest tests
pnpm prisma:generate    # Regenerate Prisma client
pnpm prisma:migrate     # Create + run migration
pnpm prisma:studio      # Prisma Studio GUI
```
