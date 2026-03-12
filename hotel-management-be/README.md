# Hotel Management - Backend

NestJS backend API cho hệ thống quản lý khách sạn.

## Yêu cầu hệ thống

- **Node.js** >= 18
- **pnpm** >= 9
- **Docker** & **Docker Compose** (để chạy PostgreSQL)

## Cài đặt & Chạy dự án

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Cấu hình biến môi trường

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Các biến môi trường chính:

| Biến | Mô tả | Giá trị mặc định |
|------|--------|-------------------|
| `APP_PORT` | Port chạy server | `3000` |
| `APP_ENV` | Môi trường | `development` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:postgres@localhost:5432/hotel_management?schema=public` |
| `JWT_SECRET` | Secret key cho JWT | _(thay đổi khi lên production)_ |

### 3. Khởi động PostgreSQL bằng Docker

```bash
docker compose up -d
```

Lệnh này sẽ khởi động container PostgreSQL 17 tại `localhost:5432`.

Kiểm tra container đã chạy:

```bash
docker compose ps
```

### 4. Prisma - Generate client & Migrate database

**Generate Prisma Client** (bắt buộc chạy lần đầu và mỗi khi thay đổi `schema.prisma`):

```bash
pnpm prisma:generate
```

> Prisma Client được generate vào `node_modules/.prisma/client` (mặc định) và import qua `@prisma/client`.
> File cấu hình Prisma nằm tại `prisma.config.ts` (Prisma v7+), datasource URL được đọc từ biến `DATABASE_URL` trong `.env`.

**Chạy migration** (tạo/cập nhật bảng trong database):

```bash
pnpm prisma:migrate
```

**Xem database bằng Prisma Studio** (GUI):

```bash
pnpm prisma:studio
```

**Reset database** (xóa toàn bộ data và chạy lại migration):

```bash
pnpm prisma:reset
```

### 5. Chạy ứng dụng

```bash
# Development (watch mode - tự restart khi thay đổi code)
pnpm start:dev

# Development (không watch)
pnpm start

# Production
pnpm build
pnpm start:prod
```

Server sẽ chạy tại: `http://localhost:3000`

Swagger API docs: `http://localhost:3000/api` _(nếu đã cấu hình)_

## Cấu trúc Prisma

```
hotel-management-be/
├── prisma.config.ts          # Cấu hình Prisma v7 (datasource URL, migration path)
├── prisma/
│   ├── schema.prisma         # Định nghĩa database schema (models, relations)
│   ├── migrations/           # Các file migration
│   └── seed.ts               # Seed data
└── src/
    └── database/
        ├── prisma.service.ts # NestJS service bọc PrismaClient
        ├── database.module.ts
        └── index.ts
```

### Luồng hoạt động của Prisma

1. **`prisma.config.ts`**: Cấu hình datasource URL từ `DATABASE_URL` env (thay thế cho việc đặt `url` trực tiếp trong `schema.prisma` - đây là cách mới của Prisma v7+)
2. **`schema.prisma`**: Định nghĩa models, relations. Generator sử dụng output mặc định vào `node_modules/.prisma/client`
3. **`prisma:generate`**: Tạo Prisma Client, import qua `@prisma/client`
4. **`prisma.service.ts`**: Import `PrismaClient` từ `@prisma/client` và sử dụng `@prisma/adapter-pg` driver adapter

## Scripts

| Script | Mô tả |
|--------|--------|
| `pnpm start:dev` | Chạy dev với watch mode |
| `pnpm build` | Build production |
| `pnpm start:prod` | Chạy production |
| `pnpm prisma:generate` | Generate Prisma Client |
| `pnpm prisma:migrate` | Chạy migration (dev) |
| `pnpm prisma:migrate:prod` | Chạy migration (production) |
| `pnpm prisma:studio` | Mở Prisma Studio GUI |
| `pnpm prisma:seed` | Seed dữ liệu mẫu |
| `pnpm prisma:reset` | Reset database |
| `pnpm lint` | Lint & fix code |
| `pnpm test` | Chạy unit tests |
| `pnpm test:e2e` | Chạy e2e tests |

## Quy trình setup nhanh (TL;DR)

```bash
pnpm install                  # 1. Cài dependencies
cp .env.example .env          # 2. Tạo file .env
docker compose up -d          # 3. Khởi động PostgreSQL
pnpm prisma:generate          # 4. Generate Prisma Client
pnpm prisma:migrate           # 5. Chạy migration
pnpm start:dev                # 6. Chạy server
```
