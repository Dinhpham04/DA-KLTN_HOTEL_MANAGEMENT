import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCleanDetailNote } from '@/hooks/mutations/useCreateCleanDetailNote'
import { useDeleteCleanDetailNote } from '@/hooks/mutations/useDeleteCleanDetailNote'
import { useUpdateCleanDetailNote } from '@/hooks/mutations/useUpdateCleanDetailNote'
import { useGetCleanDetailNotes } from '@/hooks/queries/useGetCleanDetailNotes'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Props {
  detailId: number
  trigger: React.ReactNode
}

export function NoteDrawer({ detailId, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDraft, setEditingDraft] = useState('')

  const { data: notes = [], isLoading } = useGetCleanDetailNotes({
    detailId,
    enabled: open,
  })

  const createMut = useCreateCleanDetailNote({
    onSuccess: () => {
      setDraft('')
      toast.success('Đã thêm ghi chú')
    },
    onError: () => toast.error('Không thể thêm ghi chú'),
  })
  const updateMut = useUpdateCleanDetailNote({
    onSuccess: () => {
      setEditingId(null)
      setEditingDraft('')
      toast.success('Đã cập nhật ghi chú')
    },
    onError: () => toast.error('Không thể cập nhật'),
  })
  const deleteMut = useDeleteCleanDetailNote({
    onSuccess: () => toast.success('Đã xóa ghi chú'),
    onError: () => toast.error('Không thể xóa'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ghi chú</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            placeholder="Nhập nội dung ghi chú..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={draft.trim().length === 0 || createMut.isPending}
              onClick={() => createMut.mutate({ detailId, data: { noteContent: draft.trim() } })}
            >
              Thêm ghi chú
            </Button>
          </div>
        </div>

        <div className="border-t pt-3 max-h-[50vh] overflow-y-auto space-y-2">
          {isLoading && (
            <div className="text-sm text-muted-foreground text-center py-4">Đang tải...</div>
          )}
          {!isLoading && notes.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              Chưa có ghi chú nào
            </div>
          )}
          {notes.map((n) => (
            <div key={n.cleanDetailNoteId} className="rounded border p-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {n.createdStaffName ?? `#${n.createdStaffId}`} •{' '}
                  {new Date(n.createdAt).toLocaleString('vi-VN')}
                </span>
                <div className="flex gap-1">
                  {editingId === n.cleanDetailNoteId ? null : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(n.cleanDetailNoteId)
                          setEditingDraft(n.noteContent)
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMut.mutate(n.cleanDetailNoteId)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingId === n.cleanDetailNoteId ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingDraft}
                    onChange={(e) => setEditingDraft(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setEditingDraft('')
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      disabled={editingDraft.trim().length === 0 || updateMut.isPending}
                      onClick={() =>
                        updateMut.mutate({
                          noteId: n.cleanDetailNoteId,
                          data: { noteContent: editingDraft.trim() },
                        })
                      }
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{n.noteContent}</div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
