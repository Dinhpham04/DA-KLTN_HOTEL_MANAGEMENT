import CustomDialog from '@/components/common/CustomDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateCleaningDetail } from '@/hooks/mutations/useUpdateCleaningDetail'
import { useUploadImage } from '@/hooks/mutations/useUploadImage'
import { useGetCleaningDetail } from '@/hooks/queries/useGetCleaningDetail'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { cn } from '@/lib/utils'
import {
  CleaningDataType,
  type CleaningStatus,
  type UpdateCleaningDetailBody,
} from '@/types/cleaning-shift'
import { X } from 'lucide-react'
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { toast } from 'react-toastify'

type StaffValue = '' | 'external' | `${number}`
type ImageKey = 'reportImg1' | 'reportImg2' | 'reportImg3' | 'reportImg4'

interface CleaningReportDialogProps {
  detailId: number | null
  open: boolean
  reportDate: Date
  onClose: () => void
  onUpdated: () => void
}

interface ReportFormState {
  scheduledDate: string
  cleanStatus: CleaningStatus
  mainStaff: StaffValue
  checkStaff: StaffValue
  areaName: string
  startDatetime: string
  endDatetime: string
  finishDatetime: string
  comment: string
}

interface ImageValue {
  url: string
  file: File | null
}

const IMAGE_FIELDS: Array<{ key: ImageKey; label: string }> = [
  { key: 'reportImg1', label: 'Ảnh 1' },
  { key: 'reportImg2', label: 'Ảnh 2' },
  { key: 'reportImg3', label: 'Ảnh 3' },
  { key: 'reportImg4', label: 'Ảnh 4' },
]

const statusOptions: Array<{ value: CleaningStatus; label: string }> = [
  { value: 1, label: 'Chưa bắt đầu' },
  { value: 2, label: 'Đang dọn' },
  { value: 3, label: 'Tạm dừng' },
  { value: 4, label: 'Đã xong' },
  { value: 5, label: 'Đã kiểm tra' },
  { value: 6, label: 'Mở lại' },
  { value: 7, label: 'Đã hủy' },
]

const emptyImages: Record<ImageKey, ImageValue> = {
  reportImg1: { url: '', file: null },
  reportImg2: { url: '', file: null },
  reportImg3: { url: '', file: null },
  reportImg4: { url: '', file: null },
}

const defaultForm: ReportFormState = {
  scheduledDate: '',
  cleanStatus: 1,
  mainStaff: '',
  checkStaff: '',
  areaName: '',
  startDatetime: '',
  endDatetime: '',
  finishDatetime: '',
  comment: '',
}

function toDateInput(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null
}

function staffValue(id: number | null, external: boolean): StaffValue {
  if (external) return 'external'
  return id ? (`${id}` as StaffValue) : ''
}

function updateStaffPayload(value: StaffValue, prefix: 'main' | 'check') {
  const idField = prefix === 'main' ? 'mainStaffId' : 'checkStaffId'
  const externalField = prefix === 'main' ? 'mainStaffExternalFlag' : 'checkStaffExternalFlag'
  return {
    [idField]: value && value !== 'external' ? Number(value) : null,
    [externalField]: value === 'external',
  }
}

function getErrorMessage(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Không thể cập nhật báo cáo vệ sinh'
  )
}

export function CleaningReportDialog({
  detailId,
  open,
  reportDate,
  onClose,
  onUpdated,
}: CleaningReportDialogProps) {
  const [form, setForm] = useState<ReportFormState>(defaultForm)
  const [images, setImages] = useState<Record<ImageKey, ImageValue>>(emptyImages)

  const { data: detail, isFetching } = useGetCleaningDetail({
    id: detailId,
    enabled: open && detailId !== null,
  })
  const { data: staffs = [] } = useGetStaffs({})
  const uploadImage = useUploadImage()

  const updateDetail = useUpdateCleaningDetail({
    onSuccess: () => {
      toast.success('Đã cập nhật báo cáo vệ sinh')
      onUpdated()
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const staffOptions = useMemo(
    () =>
      staffs.map((staff) => ({
        value: String(staff.staffId),
        label: staff.staffNameShort || staff.staffName,
      })),
    [staffs]
  )

  useEffect(() => {
    if (!detail) return
    setForm({
      scheduledDate: toDateInput(detail.scheduledDate),
      cleanStatus: detail.cleanStatus as CleaningStatus,
      mainStaff: staffValue(detail.mainStaffId, detail.mainStaffExternalFlag),
      checkStaff: staffValue(detail.checkStaffId, detail.checkStaffExternalFlag),
      areaName: detail.areaName ?? '',
      startDatetime: toDatetimeLocal(detail.startDatetime),
      endDatetime: toDatetimeLocal(detail.endDatetime),
      finishDatetime: toDatetimeLocal(detail.finishDatetime),
      comment: detail.comment ?? '',
    })
    setImages({
      reportImg1: { url: detail.reportImg1 ?? '', file: null },
      reportImg2: { url: detail.reportImg2 ?? '', file: null },
      reportImg3: { url: detail.reportImg3 ?? '', file: null },
      reportImg4: { url: detail.reportImg4 ?? '', file: null },
    })
  }, [detail])

  const updateField = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const setFile = (key: ImageKey, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImages((prev) => ({
      ...prev,
      [key]: {
        url: URL.createObjectURL(file),
        file,
      },
    }))
  }

  const removeImage = (key: ImageKey) => {
    setImages((prev) => ({
      ...prev,
      [key]: { url: '', file: null },
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detailId) return

    const payload: UpdateCleaningDetailBody = {
      ...updateStaffPayload(form.mainStaff, 'main'),
      ...updateStaffPayload(form.checkStaff, 'check'),
      scheduledDate: form.scheduledDate || undefined,
      startDatetime: toIsoOrNull(form.startDatetime),
      endDatetime: toIsoOrNull(form.endDatetime),
      finishDatetime: toIsoOrNull(form.finishDatetime),
      cleanStatus: form.cleanStatus,
      areaName: detail?.dataType === CleaningDataType.COMMON_AREA ? form.areaName : undefined,
      comment: form.comment,
    }

    try {
      for (const { key } of IMAGE_FIELDS) {
        const image = images[key]
        if (image.file) {
          const uploaded = await uploadImage.mutateAsync({
            file: image.file,
            subfolder: `cleaning-reports/${detailId}`,
          })
          payload[key] = uploaded.url
        } else {
          payload[key] = image.url || null
        }
      }
      updateDetail.mutate({ id: detailId, data: payload })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const isSaving = updateDetail.isPending || uploadImage.isPending

  return (
    <CustomDialog
      size="medium"
      opened={open}
      changeOnOpened={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
      title="Báo cáo vệ sinh"
      trigger={<span className="hidden" />}
      customClassContent="mt-20"
      content={
        isFetching || !detail ? (
          <div className="py-12 text-center text-[1.6rem]">Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-[1.5rem]">
            <section className="overflow-x-auto">
              <table className="border-separate border-spacing-0 w-full min-w-[82rem] [&_td]:border-black [&_td]:border-r [&_td]:border-b [&_td:first-child]:border-l [&_tr:first-child_td]:border-t">
                <tbody>
                  <tr>
                    <LabelCell>Cơ sở</LabelCell>
                    <ValueCell>
                      {detail.facilityNo} / {detail.facilityName}
                    </ValueCell>
                    <LabelCell>
                      {detail.dataType === CleaningDataType.COMMON_AREA ? 'Nội dung' : 'Phòng'}
                    </LabelCell>
                    <ValueCell>
                      {detail.dataType === CleaningDataType.COMMON_AREA ? (
                        <Textarea
                          value={form.areaName}
                          onChange={(event) => updateField('areaName', event.target.value)}
                          className="border-black min-h-[7rem] text-[1.4rem]"
                        />
                      ) : (
                        (detail.roomNumber ?? '-')
                      )}
                    </ValueCell>
                  </tr>
                  <tr>
                    <LabelCell>
                      {detail.dataType === CleaningDataType.COMMON_AREA
                        ? 'Loại vệ sinh'
                        : 'Loại phòng'}
                    </LabelCell>
                    <ValueCell>
                      {detail.dataType === CleaningDataType.COMMON_AREA
                        ? 'Vệ sinh khu vực chung'
                        : (detail.roomTypeName ?? '-')}
                    </ValueCell>
                    <LabelCell>Ngày dự kiến</LabelCell>
                    <ValueCell>
                      <input
                        type="date"
                        value={form.scheduledDate}
                        onChange={(event) => updateField('scheduledDate', event.target.value)}
                        className="border border-black px-3 h-14 text-[1.4rem]"
                      />
                    </ValueCell>
                  </tr>
                  <tr>
                    <LabelCell>Trạng thái</LabelCell>
                    <ValueCell>
                      <select
                        value={form.cleanStatus}
                        onChange={(event) =>
                          updateField('cleanStatus', Number(event.target.value) as CleaningStatus)
                        }
                        className="border border-black px-3 h-14 min-w-[18rem] text-[1.4rem]"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </ValueCell>
                    <LabelCell>Nhân viên chính</LabelCell>
                    <ValueCell>
                      <StaffSelect
                        value={form.mainStaff}
                        options={staffOptions}
                        onChange={(value) => updateField('mainStaff', value)}
                      />
                    </ValueCell>
                  </tr>
                  <tr>
                    <LabelCell>Nhân viên kiểm tra</LabelCell>
                    <ValueCell>
                      <StaffSelect
                        value={form.checkStaff}
                        options={staffOptions}
                        onChange={(value) => updateField('checkStaff', value)}
                      />
                    </ValueCell>
                    <LabelCell>Ngày báo cáo</LabelCell>
                    <ValueCell>{reportDate.toLocaleDateString('vi-VN')}</ValueCell>
                  </tr>
                  <tr>
                    <LabelCell>Bắt đầu</LabelCell>
                    <ValueCell>
                      <input
                        type="datetime-local"
                        value={form.startDatetime}
                        onChange={(event) => updateField('startDatetime', event.target.value)}
                        className="border border-black px-3 h-14 text-[1.4rem]"
                      />
                    </ValueCell>
                    <LabelCell>Kết thúc</LabelCell>
                    <ValueCell>
                      <input
                        type="datetime-local"
                        value={form.endDatetime}
                        onChange={(event) => updateField('endDatetime', event.target.value)}
                        className="border border-black px-3 h-14 text-[1.4rem]"
                      />
                    </ValueCell>
                  </tr>
                  <tr>
                    <LabelCell>Xác nhận xong</LabelCell>
                    <ValueCell>
                      <input
                        type="datetime-local"
                        value={form.finishDatetime}
                        onChange={(event) => updateField('finishDatetime', event.target.value)}
                        className="border border-black px-3 h-14 text-[1.4rem]"
                      />
                    </ValueCell>
                    <LabelCell>Ghi chú</LabelCell>
                    <ValueCell>
                      <Textarea
                        value={form.comment}
                        onChange={(event) => updateField('comment', event.target.value)}
                        className="border-black min-h-[7rem] text-[1.4rem]"
                      />
                    </ValueCell>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="overflow-x-auto">
              <table className="border-separate border-spacing-0 w-full min-w-[82rem] [&_td]:border-black [&_td]:border-r [&_td]:border-b [&_td:first-child]:border-l [&_tr:first-child_td]:border-t">
                <tbody>
                  {[0, 2].map((startIndex) => (
                    <tr key={startIndex}>
                      {IMAGE_FIELDS.slice(startIndex, startIndex + 2).map(({ key, label }) => (
                        <ReportImageCell
                          key={key}
                          label={label}
                          image={images[key]}
                          inputId={`${detailId}-${key}`}
                          onChange={(event) => setFile(key, event)}
                          onRemove={() => removeImage(key)}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="flex justify-center gap-8">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gray hover:bg-primary border border-black rounded-[.4rem] w-[10rem] h-[3.6rem] font-bold text-[1.4rem] text-black hover:text-white"
              >
                Cập nhật
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray hover:bg-primary border border-black rounded-[.4rem] w-[10rem] h-[3.6rem] font-bold text-[1.4rem] text-black hover:text-white"
              >
                Đóng
              </Button>
            </div>
          </form>
        )
      }
    />
  )
}

function LabelCell({ children }: { children: ReactNode }) {
  return (
    <td className="bg-[#efefef] p-3 w-[13rem] font-bold text-center text-[1.5rem]">{children}</td>
  )
}

function ValueCell({ children }: { children: ReactNode }) {
  return <td className="p-3 min-w-[26rem]">{children}</td>
}

function StaffSelect({
  value,
  options,
  onChange,
}: {
  value: StaffValue
  options: Array<{ value: string; label: string }>
  onChange: (value: StaffValue) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as StaffValue)}
      className="border border-black px-3 h-14 min-w-[20rem] text-[1.4rem]"
    >
      <option value="">---</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      <option value="external">Đơn vị ngoài</option>
    </select>
  )
}

function ReportImageCell({
  label,
  image,
  inputId,
  onChange,
  onRemove,
}: {
  label: string
  image: ImageValue
  inputId: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}) {
  return (
    <>
      <td className="bg-[#efefef] p-3 w-[10rem] font-bold text-center text-[1.5rem]">{label}</td>
      <td className="p-3 w-[31rem]">
        <div className="relative flex items-center gap-4 min-h-[9rem]">
          <label
            htmlFor={inputId}
            className="flex justify-center items-center bg-gray hover:opacity-70 border border-black w-[6rem] h-[3.5rem] font-bold text-[1.3rem] cursor-pointer"
          >
            Chọn
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/png, image/gif, image/jpeg, image/webp"
            className="hidden"
            onChange={onChange}
          />
          {image.url ? (
            <div className="relative">
              <img src={image.url} alt={label} className="w-40 h-28 object-cover" />
              <button
                type="button"
                onClick={onRemove}
                className={cn(
                  '-top-3 -right-3 absolute flex justify-center items-center bg-[#606060] rounded-full w-8 h-8 text-white'
                )}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="text-[1.3rem] text-muted-foreground">Chưa có ảnh</span>
          )}
        </div>
      </td>
    </>
  )
}
