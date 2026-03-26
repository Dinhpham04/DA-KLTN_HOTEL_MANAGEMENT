# Hotel Management Backend - Claude Configuration

## Project Overview

Hotel Management System backend API built with NestJS, providing RESTful endpoints for hotel operations management (AIC Yokohama Weekly Mansion).

**Tech Stack:**
- NestJS 11 + TypeScript 5 (strict mode)
- Prisma 7 (ORM) + PostgreSQL
- JWT Authentication (access + refresh tokens) via Passport.js
- Swagger/OpenAPI documentation
- Jest (unit + e2e testing)
- ESLint + Prettier (linting & formatting)
- Pino (structured logging)

**Package Manager:** pnpm (NOT npm or yarn)

**API Prefix:** `/api/v1/`
**Swagger Docs:** `/api/docs` (non-production only)

---

## Directory Structure

```
src/
├── main.ts                     # Bootstrap, global pipes/filters
├── app.module.ts               # Root module - register all feature modules
├── app.controller.ts
├── app.service.ts
├── common/                     # Shared utilities
│   ├── index.ts                # Barrel export (MUST export all)
│   ├── constants/              # APP_CONSTANTS, ERROR_MESSAGES
│   ├── decorators/             # @CurrentUser, @Roles, @ApiPagination
│   ├── dto/                    # PaginationDto, shared DTOs
│   ├── enums/                  # DataStatus, StaffType, etc.
│   ├── filters/                # AllExceptionsFilter
│   ├── guards/                 # RolesGuard
│   ├── interceptors/           # TransformInterceptor
│   ├── interfaces/             # IPaginated, IRepository
│   └── pipes/                  # Custom validation pipes
├── config/                     # Configuration
│   ├── index.ts
│   ├── configs.ts              # appConfig, databaseConfig, jwtConfig
│   └── env.validation.ts
├── database/                   # Prisma
│   ├── index.ts
│   ├── prisma.service.ts
│   └── database.module.ts
└── modules/                    # Feature modules
    ├── auth/                   # Authentication (login, refresh, logout)
    ├── health/                 # Health check endpoint
    ├── staff/
    ├── facility/
    ├── room/
    ├── room-class/
    ├── room-type/
    ├── client/
    └── reservation/
```

### Feature Module Structure
```
modules/{feature}/
├── {feature}.module.ts         # Module declaration
├── {feature}.controller.ts     # HTTP endpoints
├── {feature}.service.ts        # Business logic
├── {feature}.repository.ts     # Complex Prisma queries (optional)
├── dto/
│   ├── index.ts                # Barrel export (REQUIRED)
│   ├── create-{feature}.dto.ts
│   ├── update-{feature}.dto.ts
│   ├── {feature}-filter.dto.ts
│   └── {feature}-response.dto.ts
└── interfaces/                 # (optional)
```

---

## Import Rules (CRITICAL)

### Path Aliases

| Alias | Maps to | Usage |
|-------|---------|-------|
| `@/*` | `src/*` | Any file in src |
| `@common/*` | `src/common/*` | Shared utilities |
| `@config/*` | `src/config/*` | Configuration |
| `@database/*` | `src/database/*` | Prisma service |
| `@modules/*` | `src/modules/*` | Feature modules |

### Import Rules

```typescript
// CORRECT - use path alias for cross-module imports
import { PrismaService } from '@database/prisma.service';
import { RolesGuard, Roles, CurrentUser, IPaginated, ERROR_MESSAGES } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';

// CORRECT - relative imports ONLY within same module
import { CreateFacilityDto } from './dto/create-facility.dto';
import { FacilityRepository } from './facility.repository';

// WRONG - never use deep relative paths for cross-module
import { PrismaService } from '../../../database/prisma.service';
```

### Import Order
```typescript
// 1. NestJS core
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

// 2. Third-party
import * as bcrypt from 'bcrypt';

// 3. Internal (@ alias)
import { PrismaService } from '@database/prisma.service';
import { IPaginated, ERROR_MESSAGES } from '@common/index';

// 4. Local (same module)
import { CreateFeatureDto } from './dto/create-feature.dto';

// 5. Type imports (separate)
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
```

---

## Key Patterns

### 1. Module Pattern

```typescript
// {feature}.module.ts
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { FeatureRepository } from './feature.repository';

@Module({
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService], // Export if other modules need it
})
export class FeatureModule {}
```

### 2. Controller Pattern

```typescript
// {feature}.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, CurrentUser, ApiPagination } from '@common/index';
import type { CurrentStaff } from '@common/decorators/current-user.decorator';
import { StaffType } from '@common/enums/index';
import { FeatureService } from './feature.service';
import { CreateFeatureDto, UpdateFeatureDto, FeatureFilterDto } from './dto';

@ApiTags('Feature')                      // Swagger tag (singular or plural)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('features')                   // Route (kebab-case, plural)
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'List features with pagination' })
  @ApiPagination()
  findAll(@Query() filter: FeatureFilterDto) {
    return this.featureService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.findById(id);
  }

  @Post()
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Create feature' })
  create(
    @Body() dto: CreateFeatureDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.featureService.create(dto, user.staffId);
  }

  @Patch(':id')
  @Roles(StaffType.ADMIN, StaffType.MANAGER)
  @ApiOperation({ summary: 'Update feature' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeatureDto,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.featureService.update(id, dto, user.staffId);
  }

  @Delete(':id')
  @Roles(StaffType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete feature' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentStaff,
  ) {
    return this.featureService.remove(id, user.staffId);
  }
}
```

### 3. Service Pattern

```typescript
// {feature}.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IPaginated, ERROR_MESSAGES } from '@common/index';
import { FeatureRepository } from './feature.repository';
import {
  CreateFeatureDto, UpdateFeatureDto,
  FeatureFilterDto, FeatureResponseDto,
} from './dto';

@Injectable()
export class FeatureService {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async findAll(filter: FeatureFilterDto): Promise<IPaginated<FeatureResponseDto>> {
    const { data, total } = await this.featureRepository.findAll(filter);
    return {
      items: data.map(FeatureResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<FeatureResponseDto> {
    const entity = await this.featureRepository.findById(id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return FeatureResponseDto.fromEntity(entity);
  }

  async create(dto: CreateFeatureDto, staffId: number): Promise<FeatureResponseDto> {
    const entity = await this.featureRepository.create({
      ...dto,
      createdBy: { connect: { staffId } },
      updatedBy: { connect: { staffId } },
    });
    return FeatureResponseDto.fromEntity(entity);
  }

  async update(id: number, dto: UpdateFeatureDto, staffId: number): Promise<FeatureResponseDto> {
    const existing = await this.featureRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const entity = await this.featureRepository.update(id, {
      ...dto,
      updatedBy: { connect: { staffId } },
    });
    return FeatureResponseDto.fromEntity(entity);
  }

  async remove(id: number, staffId: number): Promise<void> {
    const existing = await this.featureRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.featureRepository.softDelete(id, staffId);
  }
}
```

### 4. DTO Patterns

```typescript
// dto/create-{feature}.dto.ts
import { IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly name!: string;  // Use ! assertion for class-validator

  @ApiPropertyOptional({ description: 'Order number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;
}

// dto/update-{feature}.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFeatureDto } from './create-feature.dto';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}

// dto/{feature}-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class FeatureResponseDto {
  @ApiProperty()
  featureId!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(entity: {
    featureId: number;
    name: string;
    createdAt: Date;
  }): FeatureResponseDto {
    const dto = new FeatureResponseDto();
    dto.featureId = entity.featureId;
    dto.name = entity.name;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}

// dto/index.ts - ALWAYS create barrel export
export { CreateFeatureDto } from './create-feature.dto';
export { UpdateFeatureDto } from './update-feature.dto';
export { FeatureFilterDto } from './feature-filter.dto';
export { FeatureResponseDto } from './feature-response.dto';
```

---

## Prisma Conventions

### Schema Pattern

```prisma
model Feature {
  // PK: camelCase + "Id", autoincrement
  featureId       Int       @id @default(autoincrement()) @map("feature_id")

  // Fields: camelCase in Prisma, snake_case in DB
  featureName     String    @map("feature_name") @db.VarChar(256)
  orderNum        Int       @default(1) @map("order_num") @db.SmallInt

  // Soft delete fields - REQUIRED for all models
  dataStatus      Int       @default(1) @map("data_status") @db.SmallInt
  createdStaffId  Int       @map("created_staff_id")
  updatedStaffId  Int?      @map("updated_staff_id")
  deletedStaffId  Int?      @map("deleted_staff_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  // Relations - at the end
  createdBy       Staff     @relation("FeatureCreatedBy", fields: [createdStaffId], references: [staffId])
  updatedBy       Staff?    @relation("FeatureUpdatedBy", fields: [updatedStaffId], references: [staffId])
  deletedBy       Staff?    @relation("FeatureDeletedBy", fields: [deletedStaffId], references: [staffId])

  // Indexes
  @@index([dataStatus], map: "features_data_status_idx")

  // Table name: snake_case, plural
  @@map("features")
}
```

### Soft Delete Pattern (NEVER hard delete)

```typescript
// Repository
async softDelete(id: number, staffId: number): Promise<void> {
  await this.prisma.feature.update({
    where: { featureId: id },
    data: {
      deletedAt: new Date(),
      deletedBy: { connect: { staffId } },
    },
  });
}

// ALWAYS filter by deletedAt: null in queries
async findAll(): Promise<Feature[]> {
  return this.prisma.feature.findMany({
    where: { deletedAt: null },
  });
}
```

---

## Commands

```bash
# Development
pnpm run start:dev       # Dev server with watch mode
pnpm run start:debug     # Debug mode

# Build
pnpm run build           # nest build + tsc-alias

# Linting & Formatting
pnpm run lint            # ESLint with auto-fix
pnpm run lint:check      # ESLint check only
pnpm run format          # Prettier format

# Testing
pnpm test                # Run all tests
pnpm test:watch          # Watch mode
pnpm test:cov            # With coverage
pnpm test:e2e            # E2E tests

# Prisma
pnpm prisma:generate     # Regenerate Prisma client
pnpm prisma:migrate      # Create and apply migration
pnpm prisma:studio       # Open Prisma Studio GUI
pnpm prisma:seed         # Run seed script
pnpm prisma:reset        # Reset database
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| File | kebab-case | `room-class.service.ts` |
| Class | PascalCase | `RoomClassService` |
| Interface | I prefix | `IRepository`, `IPaginated` |
| DTO class | PascalCase + Dto | `CreateRoomDto` |
| Enum | PascalCase | `DataStatus`, `StaffType` |
| Enum member | UPPER_SNAKE | `NOT_CLEANED`, `ADMIN` |
| Method | camelCase | `findAll()`, `createRoom()` |
| Variable | camelCase | `roomName`, `staffId` |
| Constant | UPPER_SNAKE | `APP_CONSTANTS`, `ERROR_MESSAGES` |
| DB table | snake_case plural | `rooms`, `room_classes` |
| DB column | snake_case | `room_name`, `created_at` |
| Prisma model | PascalCase singular | `Room`, `RoomClass` |
| Prisma field | camelCase | `roomName`, `createdAt` |
| API route | kebab-case plural | `/api/v1/rooms` |

---

## Error Handling

```typescript
// Use NestJS built-in exceptions
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

// Use constants for messages
import { ERROR_MESSAGES } from '@common/constants/index';

throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
throw new ConflictException('Feature name already exists');

// NEVER throw plain Error
throw new Error('Something wrong');  // WRONG
```

---

## Security Rules

### Protected Routes
```typescript
// Basic JWT protection
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()

// With role restriction
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(StaffType.ADMIN, StaffType.MANAGER)
@ApiBearerAuth()
```

### Get Current User
```typescript
@CurrentUser() user: CurrentStaff
// user.staffId, user.mail, user.staffType
```

### Security DO NOTs
- Return password in response
- Log sensitive data (password, token)
- Hard-code secrets (use env variables)
- Use `console.log` (use NestJS Logger)

---

## DO NOT

1. Use npm or yarn - only pnpm
2. Use relative imports for cross-module (use @ alias)
3. Hard delete - always soft delete (set deletedAt)
4. Use magic numbers - use Enums or Constants
5. Skip Swagger decorators (@ApiTags, @ApiOperation)
6. Skip validation decorators in DTOs
7. Create module without registering in app.module.ts
8. Throw plain Error - use NestJS HttpException
9. Use console.log - use NestJS Logger
10. Return Prisma model directly - map to Response DTO
11. Use `any` without justification
12. Use `@ts-ignore` or `@ts-nocheck`
13. Forget barrel export (index.ts) in dto folder

---

## Checklist: Creating New Module

*(**MIGRATION NOTE**: If you are migrating a legacy PHP feature, DO NOT do this manually. Use the workflow: `@analyze-php-source` -> `@convert-mysql-schema` -> `@migrate-php-to-nestjs`. Then verify against this checklist.)*

1. [ ] Add model in `prisma/schema.prisma` (follow conventions)
2. [ ] Run `pnpm prisma:generate` and `pnpm prisma:migrate`
3. [ ] Create folder `src/modules/{feature}/`
4. [ ] Create DTOs in `dto/` with barrel `index.ts`
5. [ ] Create `{feature}.repository.ts` (if complex queries needed)
6. [ ] Create `{feature}.service.ts` (inject Repository or PrismaService)
7. [ ] Create `{feature}.controller.ts` (all Swagger decorators)
8. [ ] Create `{feature}.module.ts`
9. [ ] Register module in `app.module.ts`
10. [ ] Add Staff relations in schema if using audit fields
11. [ ] Create unit tests `*.spec.ts`
12. [ ] **LƯU Ý TỐI QUAN TRỌNG**: Chạy `pnpm run build`. Nếu build fail, BẮT BUỘC phải tự động phân tích lỗi, sửa lỗi cho đến khi build chạy thành công (exit code 0) thì mới được phép kết thúc task.
13. [ ] Run `pnpm test` - must pass

---

## Git Commit Format

```
<type>(<scope>): <subject>

feat(room): add room CRUD endpoints
fix(auth): handle expired refresh token
refactor(common): extract pagination logic
docs(readme): update API documentation
test(room): add unit tests for RoomService
chore(deps): update prisma to 7.4
```

**Types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore
