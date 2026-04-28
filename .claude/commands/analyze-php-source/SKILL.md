---
name: analyze-php-source
description: Phân tích PHP/Laravel source code (Model, Controller, Migration, Routes) để hiểu cấu trúc và logic trước khi chuyển đổi sang NestJS. Sử dụng đầu tiên trong workflow migration.
---

# Analyze PHP Source

Phân tích source code PHP/Laravel để hiểu cấu trúc trước khi convert sang NestJS/Prisma.

## Intent (Mục tiêu)

- **Goal**: Hiểu rõ cấu trúc, fields, relations, business logic của một feature trong source PHP trước khi convert
- **Boundaries**: Chỉ phân tích và tóm tắt — KHÔNG tạo code mới
- **When to use**: Luôn sử dụng **đầu tiên** trước khi dùng các skill convert khác

## Knowledge (Kiến thức)

### Source Project Structure

```
aic-yokohama-weekly-mansion/          # PHP/Laravel Backend
├── app/
│   ├── Http/Controllers/             # API Controllers
│   │   ├── BaseController.php        # Base CRUD logic
│   │   └── Admin/                    # Admin controllers
│   └── Models/                       # 97 Eloquent Models
├── docs/hotel_management_sql_create.sql  # MySQL DB Schema Dump
├── routes/api.php                    # All API routes (54KB)
└── lang/                             # Language files

aic-yokohama-weekly-mansion-FE/       # React Frontend (source)
├── src/
│   ├── routes/_layout/               # 29 dirs + 29 route files
│   ├── common/                       # Shared utilities
│   ├── components/                   # Reusable components
│   ├── hooks/                        # Custom hooks
│   └── i18n.ts                       # Japanese translations (15KB)
```

### Laravel Model Anatomy
```php
class Feature extends Model {
    protected $table = 'features';           // DB table name
    protected $primaryKey = 'feature_id';    // PK field
    protected $fillable = [...];             // Mass-assignable fields
    protected $casts = [...];                // Type casts
    protected $appends = [...];              // Computed attributes

    // Relations
    public function facility() { return $this->belongsTo(Facility::class, 'facility_id', 'facility_id'); }
    public function rooms() { return $this->hasMany(Room::class, 'feature_id', 'feature_id'); }

    // Scopes
    public function scopeActive($query) { return $query->where('data_status', 1); }
}
```

### Laravel Controller Anatomy
```php
class FeatureController extends BaseController {
    // BaseController provides: index, show, store, update, destroy
    // Overrides contain custom business logic
}
```

### Key Mapping Rules
| Laravel | NestJS/Prisma |
|---------|---------------|
| `$fillable` | DTO fields (CreateDto) |
| `$casts` | Prisma `@db.*` type hints |
| `belongsTo` | Prisma relation `@relation` |
| `hasMany` | Prisma `Model[]` |
| `scopeActive` | Repository `where: { deletedAt: null }` |
| Route middleware `auth:api` | `@UseGuards(AuthGuard('jwt'))` |
| FormRequest validation | class-validator decorators |

## Execution (Các bước phân tích)

### Step 1: Read Laravel Model

```
File: aic-yokohama-weekly-mansion/app/Models/{Feature}.php
```

Extract:
- `$table` → tên table trong DB
- `$primaryKey` → primary key field
- `$fillable` → danh sách fields có thể tạo/update
- `$casts` → data types
- Relations (`belongsTo`, `hasMany`, `belongsToMany`)
- Scopes (query filters)
- Accessors/Mutators (computed fields)

### Step 2: Read Database Schema (SQL Dump)

```
File: docs/hotel_management_sql_create.sql
```

Extract:
- `CREATE TABLE` statement cho feature tương ứng
- Column names, MySQL types, nullable, defaults, comments
- Indexes, unique constraints, foreign keys
*(Lưu ý: Không cần đọc file migration của Laravel vì đã có file SQL dump MySQL tổng hợp, tiết kiệm thời gian hơn rất nhiều)*

### Step 3: Read API Routes

```
File: aic-yokohama-weekly-mansion/routes/api.php
```

Search for routes related to the feature:
- HTTP method (GET, POST, PUT, DELETE)
- URL pattern
- Controller method
- Middleware (auth, roles)

### Step 4: Read Controller Logic

```
File: aic-yokohama-weekly-mansion/app/Http/Controllers/BaseController.php
File: aic-yokohama-weekly-mansion/app/Http/Controllers/Admin/{Feature}Controller.php (if exists)
```

Extract:
- Custom endpoints beyond CRUD
- Business logic (validation, transformations)
- Response format

### Step 5: Read Frontend Page (if migrating FE too)

```
File: aic-yokohama-weekly-mansion-FE/src/routes/_layout/{feature}*.tsx
```

Extract:
- UI components used
- API calls and data shape
- Japanese text strings (for translation)
- Form fields and validation
- Table columns

### Step 6: Output Summary

Tạo tóm tắt theo format sau:

```markdown
## Feature: {FeatureName}

### Database
- Table: `{table_name}`
- PK: `{pk_field}`
- Fields: [list with types]
- Relations: [list]
- Indexes: [list]

### API Endpoints
- GET /api/{route} → list (paginated)
- GET /api/{route}/{id} → detail
- POST /api/{route} → create
- PUT /api/{route}/{id} → update
- DELETE /api/{route}/{id} → soft delete

### Business Logic
- [Special validation rules]
- [Computed fields]
- [Custom scopes/filters]

### Frontend
- Page file: `{path}`
- Components: [list]
- Japanese strings to translate: [count]
- Form fields: [list]
- Table columns: [list]
```

## Verification (Kiểm tra)

- Summary bao gồm đầy đủ fields từ model
- Schema table (MySQL) đã được đọc từ file SQL dump để lấy chính xác thông tin db hiện tại
- API endpoints match với routes/api.php
- Business logic đặc biệt được ghi chú

## Edge Cases

- **DB Optimization**: Không nhất thiết phải giữ schema 100% giống MySQL cũ. Dự án dùng PostgreSQL nên có thể tối ưu các type/index theo chuẩn Postgres.
- **BaseController logic**: Đọc BaseController.php để hiểu default CRUD behavior
- **Nested relations**: Model A → B → C, cần trace cả chain
- **Polymorphic relations**: `morphTo`, `morphMany` cần xử lý đặc biệt
- **Feature bị cắt bỏ**: Nếu user nói feature này không cần, bỏ qua
