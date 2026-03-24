# Hotel Management Frontend - Claude Configuration

## Project Overview

Hotel Management System frontend built with modern React stack for managing hotel operations including reservations, rooms, clients, and staff.

**Tech Stack:**
- React 18.3.1 + TypeScript 5.7.3
- Vite 6 (build tool with SWC)
- TanStack Router (file-based routing)
- TanStack Query (server state management)
- react-hook-form + Zod (forms & validation)
- shadcn/ui + Tailwind CSS (styling)
- Biome (linting & formatting - NOT ESLint)
- i18next (internationalization - Vietnamese)
- Axios (HTTP client)

**Package Manager:** pnpm (NOT npm or yarn)

---

## Directory Structure

```
src/
├── api/                    # API modules (*.api.ts)
│   └── {feature}.api.ts    # Export object with API methods
├── components/
│   ├── common/             # Reusable business components
│   │   ├── CustomInput.tsx
│   │   ├── CustomSelect.tsx
│   │   ├── CustomDialog.tsx
│   │   └── CustomTableForm.tsx
│   ├── layouts/            # Layout components (AppLayout)
│   ├── svgs/               # SVG icon components
│   └── ui/                 # shadcn/ui primitives (DO NOT modify)
├── config/                 # App configuration
├── hooks/
│   ├── mutations/          # TanStack Query mutations (useCreate*, useUpdate*, useDelete*)
│   └── queries/            # TanStack Query queries (useGet*)
├── i18n/
│   ├── index.ts            # i18n configuration
│   └── locales/vi.json     # Vietnamese translations
├── lib/
│   ├── axios.ts            # Axios instance with interceptors
│   ├── queryClient.ts      # TanStack Query client config
│   └── utils.ts            # Utility functions (cn, formatDate, formatCurrency)
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx          # Root route (providers)
│   ├── _authenticated.tsx  # Auth layout wrapper (guard)
│   ├── _authenticated/     # Protected routes
│   │   └── {feature}.tsx   # Feature pages
│   ├── index.tsx           # Landing redirect
│   └── login.tsx           # Login page
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
    └── {feature}.ts        # Types per feature
```

---

## Key Patterns

### 1. API Module Pattern

```typescript
// src/api/{feature}.api.ts
import apiClient from '@/lib/axios'
import type { CreateFeatureBody, UpdateFeatureBody, FeatureFilterParams } from '@/types/feature'

export const featureApi = {
  getAll: (params?: FeatureFilterParams) =>
    apiClient.get<unknown>('/features', { params }),

  getById: (id: number) =>
    apiClient.get<unknown>(`/features/${id}`),

  create: (data: CreateFeatureBody) =>
    apiClient.post('/features', data),

  update: ({ featureId, ...data }: UpdateFeatureBody) =>
    apiClient.patch(`/features/${featureId}`, data),

  delete: (id: number) =>
    apiClient.delete(`/features/${id}`),
}
```

### 2. Query Hook Pattern

```typescript
// src/hooks/queries/useGet{Feature}s.ts
import { useQuery } from '@tanstack/react-query'
import { featureApi } from '@/api/feature.api'
import type { Feature, FeatureFilterParams } from '@/types/feature'

interface UseGetFeaturesParams {
  params?: FeatureFilterParams
  onSuccess?: (data: Feature[]) => void
  onError?: (error: unknown) => void
}

export function useGetFeatures({ params, onSuccess, onError }: UseGetFeaturesParams) {
  return useQuery({
    queryKey: ['features', params],
    queryFn: async () => {
      try {
        const response = await featureApi.getAll(params)
        // Normalize response if needed
        onSuccess?.(response.data)
        return response.data
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
```

### 3. Mutation Hook Pattern

```typescript
// src/hooks/mutations/useCreate{Feature}.ts
import { useMutation } from '@tanstack/react-query'
import { featureApi } from '@/api/feature.api'
import type { CreateFeatureBody } from '@/types/feature'

interface UseCreateFeatureParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateFeature({ onSuccess, onError }: UseCreateFeatureParams) {
  return useMutation({
    mutationKey: ['create-feature'],
    mutationFn: (data: CreateFeatureBody) => featureApi.create(data),
    onSuccess,
    onError,
  })
}
```

### 4. Route/Page Pattern (TanStack Router)

```typescript
// src/routes/_authenticated/{feature}.tsx (eager loading)
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/feature')({
  component: FeaturePage,
})

function FeaturePage() {
  const { t } = useTranslation()
  // Component logic...
  return <div>{t('feature.title')}</div>
}

// src/routes/_authenticated/{feature}.lazy.tsx (lazy loading for large pages)
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/feature')({
  component: FeaturePage,
})
```

### 5. Navigation Patterns

#### Link Component (Declarative)
```typescript
import { Link } from '@tanstack/react-router'

// Simple link
<Link to="/clients">Client List</Link>

// Link with dynamic params
<Link
  to="/clients/$clientId/detail"
  params={{ clientId: String(client.clientId) }}
>
  View Details
</Link>

// Link with search params
<Link to="/clients" search={{ page: 1, status: 'active' }}>
  Active Clients
</Link>
```

#### useNavigate Hook (Programmatic)
```typescript
import { useNavigate } from '@tanstack/react-router'

function Component() {
  const navigate = useNavigate()

  // Simple navigation
  navigate({ to: '/clients' })

  // Navigation with params
  navigate({
    to: '/clients/$clientId/edit',
    params: { clientId: String(id) }
  })

  // Navigation with search params
  navigate({
    to: '/clients',
    search: { page: 1, status: 'active' }
  })

  // Replace instead of push
  navigate({ to: '/clients', replace: true })
}
```

#### useParams Hook
```typescript
import { useParams } from '@tanstack/react-router'

// With explicit 'from' path (recommended - type-safe)
const { clientId } = useParams({ from: '/_authenticated/clients/$clientId/detail' })

// Alternative: Route.useParams() (when Route is exported)
const { clientId } = Route.useParams()
```

### 6. Nested Route Structure

For features with multiple pages (list, create, detail, edit):

```
src/routes/_authenticated/
├── feature.lazy.tsx           # Single page feature
└── features/                  # Multi-page feature
    ├── index.lazy.tsx         # List page (/features)
    ├── create.lazy.tsx        # Create page (/features/create)
    └── $featureId/            # Dynamic param folder
        ├── detail.lazy.tsx    # Detail page (/features/:id/detail)
        └── edit.lazy.tsx      # Edit page (/features/:id/edit)
```

**Route Definitions:**
```typescript
// List page: src/routes/_authenticated/features/index.lazy.tsx
export const Route = createLazyFileRoute('/_authenticated/features')({
  component: FeaturesListPage,
})

// Detail page: src/routes/_authenticated/features/$featureId/detail.lazy.tsx
export const Route = createLazyFileRoute('/_authenticated/features/$featureId/detail')({
  component: FeatureDetailPage,
})
```

**Conventions:**
- Use camelCase for param names: `$featureId`, `$clientId` (NOT `$feature_id`)
- Use plural for list routes: `/clients`, `/features` (NOT `/client`)
- No trailing slash in route paths

### 7. Form with Zod Validation

```typescript
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import i18n from '@/i18n'

const schema = z.object({
  name: z.string().min(1, i18n.t('validation.required', { field: 'Name' })).max(256),
  email: z.string().email(i18n.t('validation.email')),
})

type FormData = z.infer<typeof schema>

function FeatureForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </FormProvider>
  )
}
```

### 8. Type Definitions

```typescript
// src/types/{feature}.ts
export interface Feature {
  featureId: number
  dataStatus: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateFeatureBody {
  name: string
  // Required fields without id
}

export interface UpdateFeatureBody {
  featureId: number  // Always include ID for update
  name?: string      // Optional fields for partial update
}

export interface FeatureFilterParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

---

## Commands

```bash
pnpm dev           # Start dev server (port 5173)
pnpm build         # Build for production (tsc + vite build)
pnpm preview       # Preview production build
pnpm lint          # Lint with Biome
pnpm format        # Format with Biome
pnpm check         # Lint + format with auto-fix
pnpm type-check    # TypeScript type checking only
```

---

## Coding Conventions

### Biome Rules (biome.json)
- **Indent:** 2 spaces
- **Quotes:** Single quotes
- **Semicolons:** None (ASI - Automatic Semicolon Insertion)
- **Trailing commas:** ES5 style
- **Line width:** 100 characters
- **Import type:** Use `import type` for type-only imports (enforced)
- **No explicit any:** Warning (avoid when possible)
- **No non-null assertion:** Warning

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| File (component) | PascalCase.tsx | `CustomInput.tsx` |
| File (hook) | camelCase.ts | `useGetStaffs.ts` |
| File (api) | kebab-case.api.ts | `facility.api.ts` |
| File (type) | kebab-case.ts | `facility.ts` |
| Component | PascalCase | `CustomDialog` |
| Hook | camelCase (use prefix) | `useGetFacilities` |
| Variable | camelCase | `facilityName` |
| Type/Interface | PascalCase | `Facility`, `CreateFacilityBody` |
| API object | camelCase + Api suffix | `facilityApi` |
| Route param | camelCase ($paramId) | `$clientId`, `$featureId` |

### Import Order (auto-organized by Biome)
1. React imports
2. Third-party libraries
3. Internal imports with @ alias
4. Relative imports
5. Type imports (separated)

### Path Alias
- `@/*` maps to `src/*`
- Always use `@/` for imports from src directory

---

## Internationalization (i18n)

All user-facing text MUST use translations from `src/i18n/locales/vi.json`.

```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('feature.title')}</h1>
}

// For validation messages in Zod schemas (outside components)
import i18n from '@/i18n'
const message = i18n.t('validation.required', { field: 'Name' })
```

Translation structure in vi.json:
```json
{
  "common": { "save": "Lưu", "cancel": "Hủy", "delete": "Xóa" },
  "feature": {
    "title": "Quản lý feature",
    "columns": { "name": "Tên" },
    "messages": { "createSuccess": "Tạo thành công" },
    "validation": { "nameRequired": "Tên là bắt buộc" }
  }
}
```

---

## Component Patterns

### Using shadcn/ui Components
```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
```

### Using Custom Components
```typescript
import { CustomInput } from '@/components/common/CustomInput'
import CustomSelect from '@/components/common/CustomSelect'
import CustomDialog from '@/components/common/CustomDialog'
```

### Toast Notifications
```typescript
import { toast } from 'react-toastify'

toast.success(t('feature.messages.createSuccess'))
toast.error(t('common.error'))
```

### Utility Functions
```typescript
import { cn, formatDate, formatCurrency, getInitials } from '@/lib/utils'

// cn() - merge classNames
className={cn('base-class', isActive && 'active-class')}

// formatDate() - Vietnamese date format
formatDate(new Date()) // "21/03/2026"

// formatCurrency() - VND format
formatCurrency(1000000) // "1.000.000 ₫"
```

---

## DO NOT

1. Use npm or yarn - only pnpm
2. Use ESLint - project uses Biome
3. Add semicolons at end of statements
4. Use double quotes for strings
5. Use `console.log` in production code
6. Hardcode user-facing strings - always use i18n
7. Use `any` type without justification
8. Forget to add translations for new features
9. Create components without TypeScript types
10. Skip form validation with Zod
11. Modify files in `src/components/ui/` (shadcn components)
12. Import from `src/` - use `@/` alias

---

## Checklist: Adding New Feature

*(**MIGRATION NOTE**: If you are migrating a legacy Japanese feature, DO NOT do this manually from scratch. Use the workflow: `@migrate-frontend-page` combined with `@translate-japanese-ui`. Then verify against this checklist.)*

1. [ ] Create types in `src/types/{feature}.ts`
2. [ ] Create API module `src/api/{feature}.api.ts`
3. [ ] Create query hooks `src/hooks/queries/useGet{Feature}s.ts`
4. [ ] Create mutation hooks `src/hooks/mutations/useCreate{Feature}.ts`, etc.
5. [ ] Add translations to `src/i18n/locales/vi.json`
6. [ ] Create route `src/routes/_authenticated/{feature}.tsx`
7. [ ] For multi-page features: Create proper nested route structure (see Section 6)
8. [ ] Use camelCase for route params (`$featureId` not `$feature_id`)
9. [ ] Run `pnpm check` and fix any issues
10. [ ] Run `pnpm type-check` to verify types
11. [ ] Run `pnpm build` to verify production build works without errors
