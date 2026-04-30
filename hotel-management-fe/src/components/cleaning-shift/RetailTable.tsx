import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useDeleteCleaningDetail } from '@/hooks/mutations/useDeleteCleaningDetail'
import { useUpdateCleaningDetailType3 } from '@/hooks/mutations/useUpdateCleaningDetailType3'
import type { CleaningDetail } from '@/types/cleaning-shift'
import type { Staff } from '@/types/staff'
import { MessageSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { CleaningStatusBadge } from './CleaningStatusBadge'
import { NoteDrawer } from './NoteDrawer'
import { PinStatusBadge } from './PinStatusBadge'
import { StaffSelectCell } from './StaffSelectCell'
import { StatusActions } from './StatusActions'

interface Props {
  details: CleaningDetail[]
  staffs: Staff[]
  isReadonly?: boolean
}

export function RetailTable({ details, staffs, isReadonly }: Props) {
  const [drafts, setDrafts] = useState<Record<number, string>>({})

  const updateMut = useUpdateCleaningDetailType3({
    onSuccess: () => toast.success('Đã cập nhật'),
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể cập nhật'
      toast.error(message)
    },
  })

  const deleteMut = useDeleteCleaningDetail({
    onSuccess: () => toast.success('Đã xóa'),
    onError: () => toast.error('Không thể xóa'),
  })

  if (details.length === 0) {
    return (
      <div className="rounded border p-8 text-center text-sm text-muted-foreground">
        Chưa có công việc khóa & an toàn nào cho ngày này.
      </div>
    )
  }

  return (
    <div className="rounded border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10rem]">Phòng</TableHead>
            <TableHead className="w-[12rem]">Khách checkout</TableHead>
            <TableHead className="w-[10rem]">Mã PIN</TableHead>
            <TableHead className="w-[10rem]">Hiệu lực đến</TableHead>
            <TableHead className="w-[10rem]">Trạng thái PIN</TableHead>
            <TableHead className="w-[14rem]">NV kiểm tra</TableHead>
            <TableHead className="w-[10rem]">An toàn</TableHead>
            <TableHead className="w-[10rem]">Trạng thái</TableHead>
            <TableHead className="w-[14rem]">Ghi chú</TableHead>
            <TableHead className="w-[10rem]">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((d) => (
            <TableRow key={d.cleaningDetailId}>
              <TableCell>
                <div className="font-medium">{d.roomNumber ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{d.facilityName ?? ''}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{d.reserveClientName ?? '—'}</div>
                {d.reserveCheckoutAt && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(d.reserveCheckoutAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {d.pinInfo ? d.pinInfo.maskedPin : '—'}
              </TableCell>
              <TableCell className="text-xs">
                {d.pinInfo ? new Date(d.pinInfo.validTo).toLocaleString('vi-VN') : '—'}
              </TableCell>
              <TableCell>
                <PinStatusBadge pinInfo={d.pinInfo} />
              </TableCell>
              <TableCell>
                <StaffSelectCell
                  staffs={staffs}
                  staffId={d.checkStaffId}
                  externalFlag={d.checkStaffExternalFlag}
                  disabled={isReadonly}
                  onChange={({ staffId, externalFlag }) =>
                    updateMut.mutate({
                      id: d.cleaningDetailId,
                      data: { checkStaffId: staffId, checkStaffExternalFlag: externalFlag },
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id={`safety-${d.cleaningDetailId}`}
                    checked={d.checkSafetyFlag}
                    disabled={isReadonly}
                    onCheckedChange={(checked) => {
                      const next = Boolean(checked)
                      updateMut.mutate({
                        id: d.cleaningDetailId,
                        data: {
                          checkSafetyFlag: next,
                          ...(next ? { pinRevokedConfirmedAt: new Date().toISOString() } : {}),
                        },
                      })
                    }}
                  />
                  <span>Đã kiểm tra</span>
                </div>
                {d.pinRevokedConfirmedAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(d.pinRevokedConfirmedAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <CleaningStatusBadge status={d.cleanStatus} />
                  <StatusActions
                    detailId={d.cleaningDetailId}
                    status={d.cleanStatus}
                    disabled={isReadonly}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Textarea
                  rows={2}
                  className="text-sm"
                  disabled={isReadonly}
                  value={drafts[d.cleaningDetailId] ?? d.comment ?? ''}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [d.cleaningDetailId]: e.target.value }))
                  }
                  onBlur={(e) => {
                    if (e.target.value !== (d.comment ?? '')) {
                      updateMut.mutate({
                        id: d.cleaningDetailId,
                        data: { comment: e.target.value },
                      })
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <NoteDrawer
                    detailId={d.cleaningDetailId}
                    trigger={
                      <Button size="sm" variant="outline">
                        <MessageSquare size={14} />
                        <span className="ml-1">Ghi chú ({d.noteCount})</span>
                      </Button>
                    }
                  />
                  {!isReadonly && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMut.mutate(d.cleaningDetailId)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
