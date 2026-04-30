import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateCleaningDetail } from '@/hooks/mutations/useCreateCleaningDetail'
import { useUpsertCleans } from '@/hooks/mutations/useUpsertCleans'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import {
  CleaningDataType,
  type CleaningDataType as CleaningDataTypeT,
} from '@/types/cleaning-shift'
import type { Room } from '@/types/room'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Props {
  cleanId: number
  facilityId: number
  cleaningDate: string
}

export function AddDetailDialog({ cleanId, facilityId, cleaningDate }: Props) {
  const [open, setOpen] = useState(false)
  const [dataType, setDataType] = useState<CleaningDataTypeT>(CleaningDataType.ROOM)
  const [roomId, setRoomId] = useState<number | null>(null)
  const [areaName, setAreaName] = useState('')
  const [external, setExternal] = useState(false)

  const { data: roomData } = useGetRooms({
    params: { facilityId },
    enabled:
      open && (dataType === CleaningDataType.ROOM || dataType === CleaningDataType.KEY_SAFETY),
  })
  const rooms: Room[] = roomData?.data ?? []

  const upsertMut = useUpsertCleans()
  const createMut = useCreateCleaningDetail({
    onSuccess: () => {
      toast.success('Đã thêm công việc')
      setOpen(false)
      setRoomId(null)
      setAreaName('')
      setExternal(false)
    },
    onError: () => toast.error('Không thể thêm'),
  })

  const handleSubmit = async () => {
    let activeCleanId = cleanId
    if (activeCleanId === 0) {
      const created = await upsertMut.mutateAsync({ facilityId, cleaningDate })
      activeCleanId = created.data.cleanId
    }

    const needsRoom = dataType === CleaningDataType.ROOM || dataType === CleaningDataType.KEY_SAFETY
    if (needsRoom && roomId === null) {
      toast.error('Vui lòng chọn phòng')
      return
    }

    createMut.mutate({
      cleanId: activeCleanId,
      data: {
        facilityId,
        dataType,
        ...(roomId !== null && { roomId }),
        ...(dataType === CleaningDataType.COMMON_AREA &&
          areaName.trim().length > 0 && { areaName: areaName.trim() }),
        scheduledDate: cleaningDate,
        mainStaffExternalFlag: external,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Plus size={14} className="mr-1" />
          Thêm công việc
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm công việc dọn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Loại công việc</Label>
            <Select
              value={String(dataType)}
              onValueChange={(v) => setDataType(Number(v) as CleaningDataTypeT)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(CleaningDataType.ROOM)}>Dọn phòng</SelectItem>
                <SelectItem value={String(CleaningDataType.COMMON_AREA)}>
                  Dọn khu vực chung
                </SelectItem>
                <SelectItem value={String(CleaningDataType.KEY_SAFETY)}>Khóa & An toàn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dataType === CleaningDataType.COMMON_AREA && (
            <div className="space-y-1">
              <Label>Tên khu vực</Label>
              <Input
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="VD: Sảnh tầng 1, Hành lang..."
              />
            </div>
          )}

          {(dataType === CleaningDataType.ROOM || dataType === CleaningDataType.KEY_SAFETY) && (
            <div className="space-y-1">
              <Label>Phòng</Label>
              <Select
                value={roomId !== null ? String(roomId) : ''}
                onValueChange={(v) => setRoomId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.roomId} value={String(r.roomId)}>
                      {r.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              id="add-external-staff"
              checked={external}
              onCheckedChange={(v) => setExternal(Boolean(v))}
            />
            <span>Nhân viên ngoài</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || upsertMut.isPending}>
              Thêm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
