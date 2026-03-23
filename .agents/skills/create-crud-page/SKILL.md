---
name: create-crud-page
description: Tạo CRUD management page hoàn chỉnh với DataTable, CustomDialog form, search/filter. Sử dụng khi cần xây dựng trang quản lý master data (tương tự staff-master, store-master).
---

# Create CRUD Page

Tạo CRUD management page hoàn chỉnh với DataTable + CustomDialog form theo pattern của project.

## Intent (Mục tiêu)

- **Goal**: Build trang quản lý CRUD với table, search, add/edit dialog, delete confirmation
- **Boundaries**: Tạo page component — giả định types, API, hooks đã có sẵn (dùng `create-react-feature` trước)
- **When to use**: Khi cần trang master data management (tương tự staff-master, store-master)

## Knowledge (Kiến thức)

### UI Components Available
- **CustomTableForm**: Table with built-in search, pagination
- **CustomDialog**: Modal dialog với form
- **CustomInput**: Form input field
- **CustomSelect**: Dropdown select
- **shadcn/ui**: Button, Dialog, Input, Select, etc.
- **react-hook-form + Zod**: Form state + validation

### Page Layout Pattern
```
┌─────────────────────────────────────┐
│  Title (h1)           [+ Add Button]│
│  ─────────────────────────────────  │
│  Search/Filter Bar                  │
│  ─────────────────────────────────  │
│  DataTable                          │
│  │ Col1 │ Col2 │ Col3 │ Actions │   │
│  │ ...  │ ...  │ ...  │ ✏️ 🗑️  │   │
│  │ ...  │ ...  │ ...  │ ✏️ 🗑️  │   │
│  ─────────────────────────────────  │
│  Pagination                         │
└─────────────────────────────────────┘
```

### Common Patterns
- Toast notifications: `toast.success(t('feature.messages.createSuccess'))`
- Query invalidation after mutation: `queryClient.invalidateQueries({ queryKey: ['features'] })`
- Form reset on dialog close: `form.reset()`
- Loading states: `isLoading` from query hooks
- Error handling: `onError` callback in mutation hooks

## Execution (Các bước thực hiện)

### Step 1: Setup Page Component

```typescript
import { createLazyFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import i18n from '@/i18n'
import { useState } from 'react'

// Import hooks
import { useGetFeatures } from '@/hooks/queries/useGetFeatures'
import { useCreateFeature } from '@/hooks/mutations/useCreateFeature'
import { useUpdateFeature } from '@/hooks/mutations/useUpdateFeature'
import { useDeleteFeature } from '@/hooks/mutations/useDeleteFeature'

// Import UI
import { Button } from '@/components/ui/button'
import CustomDialog from '@/components/common/CustomDialog'

// Import types
import type { Feature } from '@/types/feature'
```

### Step 2: Define Zod Schema

```typescript
const schema = z.object({
  featureName: z
    .string()
    .min(1, i18n.t('feature.validation.nameRequired'))
    .max(256, i18n.t('feature.validation.nameTooLong')),
  orderNum: z.coerce.number().min(1).optional(),
})

type FormData = z.infer<typeof schema>
```

### Step 3: Build Page with State

```typescript
function FeaturePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Feature | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { featureName: '', orderNum: 1 },
  })

  // Queries & Mutations
  const { data, isLoading } = useGetFeatures({})

  const createMutation = useCreateFeature({
    onSuccess: () => {
      toast.success(t('feature.messages.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['features'] })
      handleCloseDialog()
    },
  })

  const updateMutation = useUpdateFeature({
    onSuccess: () => {
      toast.success(t('feature.messages.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['features'] })
      handleCloseDialog()
    },
  })

  const deleteMutation = useDeleteFeature({
    onSuccess: () => {
      toast.success(t('feature.messages.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })

  // Handlers
  const handleOpenCreate = () => {
    setEditItem(null)
    form.reset({ featureName: '', orderNum: 1 })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (item: Feature) => {
    setEditItem(item)
    form.reset({
      featureName: item.featureName,
      orderNum: item.orderNum,
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditItem(null)
    form.reset()
  }

  const onSubmit = (values: FormData) => {
    if (editItem) {
      updateMutation.mutate({ featureId: editItem.featureId, ...values })
    } else {
      createMutation.mutate(values)
    }
  }

  // Render table + dialog
}
```

### Step 4: Add Table Columns

Define columns with edit/delete action buttons.

### Step 5: Add CustomDialog with Form

```typescript
<CustomDialog
  open={isDialogOpen}
  onClose={handleCloseDialog}
  title={editItem ? t('feature.edit') : t('feature.add')}
>
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit">
        {t('common.save')}
      </Button>
    </form>
  </FormProvider>
</CustomDialog>
```

## Verification (Kiểm tra)

```bash
cd hotel-management-fe
pnpm check         # Biome lint + format
pnpm type-check    # TypeScript check
```

Kiểm tra trực quan trên browser:
1. Table hiển thị data đúng
2. Add dialog mở và tạo record mới
3. Edit dialog populate đúng data
4. Delete xóa record (soft delete)
5. Toast notifications hiển thị
6. Form validation hoạt động

### 4C Checklist
- **Concise**: Reuse `CustomDialog`, `CustomTableForm` — không duplicate logic
- **Clear**: State management rõ ràng (isDialogOpen, editItem)
- **Correct**: Form reset đúng khi open/close, query invalidation sau mutation
- **Complete**: CRUD đầy đủ + search + pagination + validation + toast

## Reference Files

- Staff master page: `src/routes/_authenticated/staff-master.tsx`
- Store master page: `src/routes/_authenticated/store-master.lazy.tsx`
- CustomDialog: `src/components/common/CustomDialog.tsx`
- CustomTableForm: `src/components/common/CustomTableForm.tsx`

## Edge Cases

- Optimistic updates → chỉ dùng khi cần UX tốt hơn, mặc định dùng invalidation
- Large tables → lazy loading route (`.lazy.tsx`)
- Multi-step forms → chia thành tabs trong dialog
- File upload → sử dụng custom upload component
- Dependent selects (e.g., room type → room) → sử dụng `watch()` để monitor changes
