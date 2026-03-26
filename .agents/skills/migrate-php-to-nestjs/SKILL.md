---
name: migrate-php-to-nestjs
description: Convert PHP/Laravel controller + model sang NestJS module hoàn chỉnh. Giữ nguyên ĐẦU RA của business logic nhưng PHẢI refactor/tối ưu code theo chuẩn NestJS/TypeScript, tuyệt đối không dịch word-by-word từ PHP sang.
---

# Migrate PHP to NestJS

Convert PHP/Laravel backend code sang NestJS module. **Yêu cầu cốt lõi**: Giữ nguyên đầu ra (behavior) của business logic nhưng phải tối ưu performance, cấu trúc lại code cho clean theo chuẩn TypeScript/NestJS, không copy-paste mindset của PHP (như associative array, N+1 query) sang.

## Intent (Mục tiêu)

- **Goal 1**: Chuyển đổi PHP controller + model logic → NestJS module hoàn chỉnh
- **Goal 2**: Refactor code dở/cũ của PHP thành code TypeScript tối ưu, strict type, dùng đúng Dependency Injection của NestJS
- **Boundaries**: Backend only — Prisma model phải tồn tại trước (dùng `convert-mysql-schema`)
- **When to use**: Sau `analyze-php-source` và `convert-mysql-schema`

## Knowledge (Kiến thức)

### Pattern Mapping: Laravel → NestJS

| Laravel | NestJS |
|---------|--------|
| Controller method | Controller method + decorators |
| FormRequest | DTO + class-validator |
| Eloquent Model | Prisma Client |
| Model Scope | Repository method |
| `$request->user()` | `@CurrentUser() user: CurrentStaff` |
| `auth:api` middleware | `@UseGuards(AuthGuard('jwt'))` |
| `abort(404)` | `throw new NotFoundException()` |
| `response()->json()` | Return from controller (auto-serialized) |
| `DB::transaction()` | `prisma.$transaction()` |

### BaseController CRUD Mapping

Source `BaseController.php` provides default CRUD. Map to:

```
BaseController::index()   → Controller.findAll() + Service.findAll()
BaseController::show()    → Controller.findById() + Service.findById()
BaseController::store()   → Controller.create() + Service.create()
BaseController::update()  → Controller.update() + Service.update()
BaseController::destroy() → Controller.remove() + Service.remove()
```

### NestJS Target Structure
```
src/modules/{feature}/
├── {feature}.module.ts
├── {feature}.controller.ts
├── {feature}.service.ts
├── {feature}.repository.ts
└── dto/
    ├── index.ts
    ├── create-{feature}.dto.ts
    ├── update-{feature}.dto.ts
    ├── {feature}-filter.dto.ts
    └── {feature}-response.dto.ts
```

### Source Files
- BaseController: `aic-yokohama-weekly-mansion/app/Http/Controllers/BaseController.php`
- Routes: `aic-yokohama-weekly-mansion/routes/api.php`
- Models: `aic-yokohama-weekly-mansion/app/Models/`

### Target Location
- Modules: `hotel-management-be/src/modules/`
- Register: `hotel-management-be/src/app.module.ts`

## Execution (Các bước thực hiện)

### Step 1: Read PHP Source

Read in order:
1. `app/Models/{Feature}.php` → fields, relations, scopes
2. `routes/api.php` → find routes for this feature
3. `app/Http/Controllers/BaseController.php` → default CRUD logic
4. Custom controller if exists

### Step 2: Create DTOs from PHP $fillable (Clean up Japan-specific fields)

Map `$fillable` fields → `CreateFeatureDto`:
- **QUAN TRỌNG**: Xóa bỏ hoàn toàn các trường dữ liệu đặc thù của thị trường Nhật Bản như `name_kana`, `name_ruby`, `furigana`. Cập nhật các trường như `client_name_en` thành tiêu chuẩn chung `clientName` (nếu phù hợp).

```php
// PHP
protected $fillable = ['feature_name', 'order_num', 'facility_id'];
```
→
```typescript
// NestJS DTO
export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name', maxLength: 256 })
  @IsString()
  @MaxLength(256)
  readonly featureName!: string;

  @ApiPropertyOptional({ description: 'Order number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly orderNum?: number;

  @ApiProperty({ description: 'Facility ID' })
  @IsInt()
  readonly facilityId!: number;
}
```

### Step 3: Create ResponseDto from PHP Model

Map model attributes → `FeatureResponseDto`:
```typescript
export class FeatureResponseDto {
  @ApiProperty()
  featureId!: number;

  // Map all relevant fields...

  static fromEntity(entity: Feature): FeatureResponseDto {
    const dto = new FeatureResponseDto();
    // Map fields...
    return dto;
  }
}
```

### Step 4: Create Repository

Convert Eloquent queries → Prisma queries:

```php
// PHP Eloquent
$features = Feature::where('data_status', 1)
    ->where('facility_id', $facilityId)
    ->orderBy('order_num')
    ->paginate($perPage);
```
→
```typescript
// Prisma
async findAll(filter: FeatureFilterDto) {
  const where: Prisma.FeatureWhereInput = {
    deletedAt: null,
    ...(filter.facilityId && { facilityId: filter.facilityId }),
  };
  const [data, total] = await Promise.all([
    this.prisma.feature.findMany({
      where,
      skip: (filter.page - 1) * filter.limit,
      take: filter.limit,
      orderBy: { orderNum: 'asc' },
    }),
    this.prisma.feature.count({ where }),
  ]);
  return { data, total };
}
```

### Step 5: Create Service (with Optimization)

Convert PHP business logic → TypeScript. **Phải tối ưu cấu trúc**:
- **Tuyệt đối không dịch 1-1 (word-by-word)** những đoạn PHP lặp code, phải refactor lại cho clean.
- Tận dụng TypeScript strict typing (không dùng `any`), định nghĩa Type/Interface rõ ràng thay vì dùng mảng `associative array` hỗn loạn của PHP.
- Viết logic theo hướng Dependency Injection, gom tách các helper functions ra ngoài nếu file quá dài.
- Giải quyết N+1 Query: Nếu thấy source PHP đang lặp vòng lặp gọi query Eloquent, phải viết lại bằng Prisma `include` hoặc batch fetch.
- Keep the same validation rules & error handling (404, 409) nhưng implement qua Exceptions chuẩn của NestJS.
- Map `$request->user()` → `@CurrentUser()` decorator.

### Step 6: Create Controller

Map routes/api.php → NestJS controller:

```php
// PHP Routes
Route::get('/features', [FeatureController::class, 'index']);
Route::get('/features/{id}', [FeatureController::class, 'show']);
Route::post('/features', [FeatureController::class, 'store']);
Route::put('/features/{id}', [FeatureController::class, 'update']);
Route::delete('/features/{id}', [FeatureController::class, 'destroy']);
```
→
```typescript
@ApiTags('Feature')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('features')
export class FeatureController {
  @Get() findAll(@Query() filter: FeatureFilterDto) {}
  @Get(':id') findById(@Param('id', ParseIntPipe) id: number) {}
  @Post() create(@Body() dto: CreateFeatureDto, @CurrentUser() user: CurrentStaff) {}
  @Patch(':id') update(...) {}
  @Delete(':id') remove(...) {}
}
```

### Step 7: Create Module & Register

```typescript
@Module({
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService],
})
export class FeatureModule {}
```

Register in `app.module.ts`.

## Verification (Kiểm tra)

```bash
cd hotel-management-be
pnpm run build    # LƯU Ý TỐI QUAN TRỌNG: Nếu build có lỗi, BẮT BUỘC phải đọc log và tự viết bài giải pháp sửa lỗi cho đến khi pass hẳn. KHÔNG ĐƯỢC CHỜ USER NHẮC NHỞ.
pnpm test         # Tests pass
```

Verify API endpoints match PHP source:
- Same HTTP methods
- Same URL patterns (adjusted for `/api/v1/` prefix)
- Same response shape (or documented differences)
- Same validation rules

### 4C Checklist
- **Concise**: Tối ưu logic, loại bỏ code dư thừa/code rác cục bộ của PHP cũ. Gộp các query rời rạc lại cho hiệu quả (chống N+1).
- **Clear**: Code viết theo đúng "TypeScript way" (Interfaces, Type-safe) chứ không phải tư duy "PHP way". Cấu trúc rõ ràng, dùng tận để NestJS DI, Pipes.
- **Correct**: Đầu ra API (Business logic results) phải giữ nguyên y hệt nguồn gốc, các case tính toán phải đảm bảo chính xác.
- **Complete**: Cover đủ các rule validation phức tạp, error handling, permission guard.

## Edge Cases

- **Custom controller methods** (beyond CRUD): Convert từng method riêng
- **Complex Eloquent queries**: Có thể cần raw Prisma query `$queryRaw`
- **File upload endpoints**: Sử dụng NestJS `@UploadedFile()` + Multer
- **Batch operations**: Convert bulk create/update logic
- **Nested resource routes**: e.g., `/facilities/{id}/rooms` → separate controller or nested route
- **Feature cắt bỏ**: Skip endpoints/logic mà user nói không cần
