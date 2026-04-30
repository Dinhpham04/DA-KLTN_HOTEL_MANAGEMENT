import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Staff } from '@/types/staff'

interface Props {
  staffs: Staff[]
  staffId: number | null
  externalFlag: boolean
  onChange: (next: { staffId: number | null; externalFlag: boolean }) => void
  showExternal?: boolean
  disabled?: boolean
}

export function StaffSelectCell({
  staffs,
  staffId,
  externalFlag,
  onChange,
  showExternal = true,
  disabled,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={disabled}
        value={staffId !== null ? String(staffId) : 'none'}
        onValueChange={(val) =>
          onChange({
            staffId: val === 'none' ? null : Number(val),
            externalFlag,
          })
        }
      >
        <SelectTrigger className="h-9 min-w-[10rem]">
          <SelectValue placeholder="Chọn nhân viên" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— Bỏ chọn —</SelectItem>
          {staffs.map((s) => (
            <SelectItem key={s.staffId} value={String(s.staffId)}>
              {s.staffName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showExternal && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Checkbox
            id={`ext-${staffId ?? 'none'}`}
            checked={externalFlag}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ staffId, externalFlag: Boolean(checked) })}
          />
          <span>Ngoài</span>
        </div>
      )}
    </div>
  )
}
