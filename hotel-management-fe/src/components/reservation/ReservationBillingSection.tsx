import dayjs from 'dayjs'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'

import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import type { Option } from '@/components/common/CustomSelectClean'
import { NButton } from '@/components/ui/new-button'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCreateSaleDetail, useUpdateSaleDetail } from '@/hooks/mutations/useSaleDetailMutations'
import { useGetPaymentMethods } from '@/hooks/queries/useGetPaymentMethods'
import { useGetSaleDetails } from '@/hooks/queries/useGetSaleDetails'
import { cn, formatCurrency } from '@/lib/utils'
import type { RequestType } from '@/types/pricing'

// ─── Types ────────────────────────────────────────────────────────────────────

type RowPayment = {
  saleDetailId?: number
  paymentMethodId: string
  chargeStaffId: string
  saleDate: string
  summary: string
  occupierName: string
  dirty: boolean
}

type RequestNormalRow = {
  request_detail_id?: number
  source_key?: string
  request_type_id?: string
  request_from?: string
  request_to?: string
  count?: string
  count_unit?: string
  unit_price?: string
  charge_staff_id?: string
}

const COUNT_UNIT_LABEL: Record<string, string> = { '1': 'Tháng', '2': 'Ngày', '3': 'Lần' }
const EMPTY_OPT: Option = { value: '', label: '---' }

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReservationBillingSectionProps {
  reserveId: number
  requestTypes: RequestType[]
  staffOptions: Option[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReservationBillingSection({
  reserveId,
  requestTypes,
  staffOptions,
}: ReservationBillingSectionProps) {
  const form = useFormContext()
  const rows: RequestNormalRow[] =
    useWatch({ control: form.control, name: 'reserve.request_normal' }) ?? []

  const { data: sdData } = useGetSaleDetails(reserveId)
  const { data: pmData } = useGetPaymentMethods()
  const saleDetails = sdData?.data ?? []
  const paymentMethods = pmData?.data ?? []

  // ── Local payment state ───────────────────────────────────────────────────
  const [paymentMap, setPaymentMap] = useState<Map<number, RowPayment>>(new Map())

  useEffect(() => {
    setPaymentMap((prev) => {
      const next = new Map<number, RowPayment>()
      rows.forEach((row, idx) => {
        const existing = prev.get(idx)
        if (existing?.dirty) {
          next.set(idx, existing)
          return
        }
        const linked = row.request_detail_id
          ? saleDetails.find((s) => s.requestDetailId === row.request_detail_id)
          : saleDetails.find(
              (s) =>
                s.requestDetailId === null &&
                s.requestTypeId === Number(row.request_type_id) &&
                (s.requestFrom ? s.requestFrom.split('T')[0] : null) ===
                  (row.request_from ?? null) &&
                (s.requestTo ? s.requestTo.split('T')[0] : null) === (row.request_to ?? null)
            )
        const defaultSaleDate = linked
          ? (linked.saleDate ?? '')
          : (existing?.saleDate ?? dayjs().format('YYYY-MM-DD'))
        next.set(idx, {
          saleDetailId: linked?.saleDetailId ?? existing?.saleDetailId,
          paymentMethodId: linked?.paymentMethodId
            ? String(linked.paymentMethodId)
            : (existing?.paymentMethodId ?? ''),
          chargeStaffId: linked?.chargeStaffId
            ? String(linked.chargeStaffId)
            : (existing?.chargeStaffId ?? ''),
          saleDate: defaultSaleDate,
          summary: linked?.summary ?? existing?.summary ?? '',
          occupierName: linked?.occupierName ?? existing?.occupierName ?? '',
          dirty: false,
        })
      })
      return next
    })
  }, [rows, saleDetails])

  const updatePayment = (idx: number, patch: Partial<RowPayment>) =>
    setPaymentMap((prev) => {
      const cur = prev.get(idx)
      if (!cur) return prev
      return new Map(prev).set(idx, { ...cur, ...patch, dirty: true })
    })

  // ── Checkbox selection ────────────────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const toggleRow = (idx: number) =>
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })

  const allSelected = rows.length > 0 && selectedRows.size === rows.length
  const someSelected = selectedRows.size > 0 && !allSelected

  const toggleAll = () =>
    setSelectedRows(allSelected || someSelected ? new Set() : new Set(rows.map((_, i) => i)))

  // ── Validation: button phụ thuộc vào checkbox + 3 field bắt buộc ──────────
  const selectedValidation = useMemo(() => {
    if (selectedRows.size === 0)
      return { canSave: false, hint: 'Chọn ít nhất 1 khoản để thanh toán' }
    const missing: string[] = []
    for (const idx of selectedRows) {
      const p = paymentMap.get(idx)
      if (!p?.paymentMethodId) {
        missing.push('Phương thức TT')
        break
      }
      if (!p?.occupierName?.trim()) {
        missing.push('Tên người TT')
        break
      }
      if (!p?.chargeStaffId) {
        missing.push('Nhân viên TT')
        break
      }
    }
    if (missing.length > 0) return { canSave: false, hint: `Còn thiếu: ${missing.join(', ')}` }
    return { canSave: true, hint: '' }
  }, [selectedRows, paymentMap])

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutateAsync: createSd } = useCreateSaleDetail({
    onError: () => toast.error('Lưu thanh toán thất bại'),
  })
  const { mutateAsync: updateSd } = useUpdateSaleDetail(reserveId, {
    onError: () => toast.error('Cập nhật thanh toán thất bại'),
  })

  const [saving, setSaving] = useState(false)

  const saveAll = async () => {
    if (!selectedValidation.canSave) return
    setSaving(true)
    let savedCount = 0
    const resolvedIds = new Map<number, number>() // idx → saleDetailId

    for (const idx of selectedRows) {
      const p = paymentMap.get(idx)
      const row = rows[idx]
      if (!p || !row) continue
      const unitPrice = Number(row.unit_price ?? 0)
      const count = Number(row.count ?? 1)
      const countUnit = Number(row.count_unit ?? 2)
      const body = {
        requestTypeId: Number(row.request_type_id ?? 0),
        requestDetailId: row.request_detail_id,
        paymentMethodId: p.paymentMethodId ? Number(p.paymentMethodId) : undefined,
        chargeStaffId: p.chargeStaffId ? Number(p.chargeStaffId) : undefined,
        totalPrice: unitPrice * count,
        countUnit,
        requestFrom: row.request_from || undefined,
        requestTo: row.request_to || undefined,
        saleDate: p.saleDate || undefined,
        summary: p.summary || undefined,
        occupierName: p.occupierName || undefined,
      }
      try {
        if (p.saleDetailId) {
          await updateSd({ id: p.saleDetailId, data: body })
          resolvedIds.set(idx, p.saleDetailId)
        } else {
          const res = await createSd({ ...body, reserveId })
          resolvedIds.set(idx, res.data.saleDetailId)
        }
        savedCount++
      } catch {
        // error handled by mutation
      }
    }
    if (savedCount > 0) {
      setPaymentMap((prev) => {
        const next = new Map(prev)
        for (const idx of selectedRows) {
          const v = next.get(idx)
          if (v)
            next.set(idx, {
              ...v,
              dirty: false,
              saleDetailId: resolvedIds.get(idx) ?? v.saleDetailId,
            })
        }
        return next
      })
      setSelectedRows(new Set())
      toast.success(`Đã lưu ${savedCount} khoản thanh toán`)
    }
    setSaving(false)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalInvoice = useMemo(
    () => rows.reduce((s, r) => s + Number(r.unit_price ?? 0) * Number(r.count ?? 1), 0),
    [rows]
  )
  const selectedTotal = useMemo(
    () =>
      Array.from(selectedRows).reduce((s, idx) => {
        const r = rows[idx]
        if (!r) return s
        return s + Number(r.unit_price ?? 0) * Number(r.count ?? 1)
      }, 0),
    [selectedRows, rows]
  )
  const totalPaid = useMemo(
    () => saleDetails.reduce((s, r) => s + (r.totalPrice ?? 0), 0),
    [saleDetails]
  )
  const remaining = totalInvoice - totalPaid

  // ── Option lists ─────────────────────────────────────────────────────────
  const getTypeName = (id?: string) =>
    requestTypes.find((r) => r.requestTypeId === Number(id))?.requestTypeName ?? `#${id ?? '?'}`

  const pmOptions: Option[] = [
    EMPTY_OPT,
    ...paymentMethods.map((pm) => ({
      value: String(pm.paymentMethodId),
      label: pm.displayName ?? `#${pm.paymentMethodId}`,
    })),
  ]

  const staffOpts: Option[] = [EMPTY_OPT, ...staffOptions]

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="w-full">
      <div className="max-h-[47rem] overflow-auto">
        <table className="border-black border-l w-full min-w-[120rem] text-[1.6rem] border-separate border-spacing-0">
          {/* ── Header ── */}
          <TableHeader className="z-[999] bg-[#EEEEEE]">
            <TableRow>
              {/* Checkbox chọn tất cả */}
              <TableHead
                className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 text-center w-[5rem]"
                rowSpan={2}
              >
                <CustomCheckbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={toggleAll}
                />
              </TableHead>

              <TableHead
                className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center min-w-[8rem]"
                rowSpan={2}
              >
                Hạng mục
              </TableHead>
              <TableHead
                className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center min-w-[14rem]"
                rowSpan={2}
              >
                Phương thức TT
              </TableHead>
              <TableHead
                className="top-0 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center min-w-[14rem]"
                rowSpan={2}
              >
                Kỳ thanh toán
              </TableHead>
              {/* <TableHead
                className="top-0 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center whitespace-nowrap w-[9rem]"
                rowSpan={2}
              >
                Số ngày
              </TableHead> */}
              <TableHead
                className="top-0 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center whitespace-nowrap w-[9rem]"
                rowSpan={2}
              >
                Số lượng
              </TableHead>
              <TableHead
                className="top-0 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center w-[12rem]"
                rowSpan={2}
              >
                Đơn giá
              </TableHead>
              <TableHead
                className="top-0 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center w-[12rem]"
                rowSpan={2}
              >
                Tổng tiền
              </TableHead>
              <TableHead
                className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center min-w-[12rem]"
                rowSpan={2}
              >
                Ngày TT
              </TableHead>
              <TableHead
                className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-14 font-bold text-center min-w-[8rem]"
                rowSpan={2}
              >
                Nhân viên TT
              </TableHead>
            </TableRow>
            <TableRow />
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-10 border-black border-r border-b text-gray-400 text-center"
                >
                  Chưa có khoản mục. Thêm khoản mục ở phần Thông tin thanh toán bên trên.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                const p = paymentMap.get(idx)
                const rowTotal = Number(row.unit_price ?? 0) * Number(row.count ?? 1)
                const hasSaleDetail = !!p?.saleDetailId
                const isSelected = selectedRows.has(idx)
                const countUnitLabel = COUNT_UNIT_LABEL[row.count_unit ?? '2'] ?? ''
                const rowKey =
                  row.request_detail_id ??
                  row.source_key ??
                  [
                    row.request_type_id,
                    row.request_from,
                    row.request_to,
                    row.count,
                    row.count_unit,
                    row.unit_price,
                  ].join('-')
                return (
                  <Fragment key={rowKey}>
                    {/* ── Row 1 ── */}
                    <TableRow
                      className={cn(
                        'border-t',
                        isSelected
                          ? 'bg-blue-50 hover:bg-blue-50'
                          : hasSaleDetail
                            ? 'bg-green-50 hover:bg-green-50'
                            : ''
                      )}
                    >
                      {/* Checkbox — rowSpan 2 */}
                      <TableCell
                        className="p-3 border-black border-r border-b text-center"
                        rowSpan={2}
                      >
                        <CustomCheckbox
                          checked={isSelected}
                          disabled={hasSaleDetail}
                          onCheckedChange={() => !hasSaleDetail && toggleRow(idx)}
                        />
                      </TableCell>

                      {/* Hạng mục — rowSpan 2 */}
                      <TableCell
                        className="py-3 border-black border-r border-b text-center leading-tight"
                        rowSpan={2}
                      >
                        <div>{getTypeName(row.request_type_id)}</div>
                        {hasSaleDetail && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[1.1rem] bg-green-100 text-green-700 font-bold border border-green-300">
                            Đã TT
                          </span>
                        )}
                      </TableCell>

                      {/* PT TT */}
                      <TableCell className="py-3 px-4 border-black border-r border-b">
                        <CustomSelectClean
                          option={pmOptions}
                          selected={pmOptions.find((o) => o.value === p?.paymentMethodId)}
                          change={(opt) => updatePayment(idx, { paymentMethodId: opt.value })}
                          customClassMain="w-full h-[3.4rem]"
                          disabledSelect={hasSaleDetail}
                        />
                      </TableCell>

                      {/* Kỳ TT */}
                      <TableCell className="py-3 px-4 border-black border-r border-b text-center text-[1.4rem] whitespace-nowrap">
                        {row.request_from && row.request_to ? (
                          <div className="flex flex-col gap-0.5">
                            <span>{dayjs(row.request_from).format('YYYY/MM/DD')}</span>
                            <span className="text-[1.2rem]">～</span>
                            <span>{dayjs(row.request_to).format('YYYY/MM/DD')}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      {/* Số ngày — rowSpan 2 */}
                      {/* <TableCell
                        className="py-3 px-4 border-black border-r border-b text-center whitespace-nowrap"
                        rowSpan={2}
                      >
                        {days != null ? (
                          <>
                            <div className="">{days}</div>
                            <br />
                            <div>{countUnitLabel}</div>
                          </>
                        ) : (
                          '—'
                        )}
                      </TableCell> */}

                      {/* Số lượng — rowSpan 2 */}
                      <TableCell
                        className="py-3 px-4 border-black border-r border-b text-center whitespace-nowrap"
                        rowSpan={2}
                      >
                        <>
                          <div className="">{row.count}</div>
                          <br />
                          <div>{countUnitLabel}</div>
                        </>
                      </TableCell>

                      {/* Đơn giá — rowSpan 2 */}
                      <TableCell
                        className="py-3 px-2 border-black border-r border-b text-right whitespace-nowrap"
                        rowSpan={2}
                      >
                        {row.unit_price ? formatCurrency(Number(row.unit_price)) : '—'}
                      </TableCell>

                      {/* Tổng tiền — rowSpan 2 */}
                      <TableCell
                        className="py-3 px-2 border-black border-r border-b text-right whitespace-nowrap font-bold"
                        rowSpan={2}
                      >
                        {formatCurrency(rowTotal)}
                      </TableCell>

                      {/* Ngày TT */}
                      <TableCell className="py-3 px-3 border-black border-r border-b text-center">
                        <CustomDatePicker
                          format="y/MM/dd"
                          className="border-transparent focus:outline focus:outline-1 w-fit"
                          value={p?.saleDate ? new Date(p.saleDate) : null}
                          change={(d) =>
                            updatePayment(idx, {
                              saleDate: d instanceof Date ? dayjs(d).format('YYYY-MM-DD') : '',
                            })
                          }
                          disable={hasSaleDetail}
                        />
                      </TableCell>

                      {/* Nhân viên TT */}
                      <TableCell className="py-3 px-4 border-black border-r border-b">
                        <CustomSelectClean
                          option={staffOpts}
                          selected={staffOpts.find((o) => o.value === p?.chargeStaffId)}
                          change={(opt) => updatePayment(idx, { chargeStaffId: opt.value })}
                          customClassMain="w-full h-[3.4rem]"
                          disabledSelect={hasSaleDetail}
                        />
                      </TableCell>
                    </TableRow>

                    {/* ── Row 2: tên người ở | ghi chú ── */}
                    <TableRow
                      className={cn(
                        isSelected
                          ? 'bg-blue-50 hover:bg-blue-50'
                          : hasSaleDetail
                            ? 'bg-green-50 hover:bg-green-50'
                            : ''
                      )}
                    >
                      {/* Tên người ở — dưới PT TT + Kỳ TT */}
                      <TableCell className="py-2 px-4 border-black border-r border-b" colSpan={2}>
                        <CustomInput
                          value={p?.occupierName ?? ''}
                          onChange={(e) => updatePayment(idx, { occupierName: e.target.value })}
                          placeholder="Tên người thanh toán"
                          className="!h-[3.4rem] w-full"
                          disabled={hasSaleDetail}
                        />
                      </TableCell>

                      {/* Ghi chú — dưới Ngày TT + Nhân viên TT */}
                      <TableCell className="py-2 px-4 border-black border-r border-b" colSpan={2}>
                        <div className="flex items-center gap-3">
                          <span className="text-[1.4rem] font-bold whitespace-nowrap text-gray-600">
                            Ghi chú:
                          </span>
                          <CustomInput
                            value={p?.summary ?? ''}
                            onChange={(e) => updatePayment(idx, { summary: e.target.value })}
                            placeholder=""
                            className="!h-[3.4rem] flex-1 w-[8rem]"
                            disabled={hasSaleDetail}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-end mt-6">
        <div className="w-[34rem]">
          <table className="w-full border-separate border-spacing-0 text-[1.6rem]">
            <tbody>
              <tr>
                <td className="bg-[#efefef] border border-black px-5 py-3 font-bold whitespace-nowrap w-[18rem]">
                  Tổng hóa đơn
                </td>
                <td className="border-t border-r border-b border-black px-5 py-3 text-right font-bold">
                  {formatCurrency(totalInvoice)}
                </td>
              </tr>
              <tr>
                <td className="bg-[#efefef] border-l border-r border-b border-black px-5 py-3 font-bold whitespace-nowrap">
                  Số tiền đã chọn
                </td>
                <td className="border-r border-b border-black px-5 py-3 text-right font-bold">
                  {formatCurrency(selectedTotal)}
                </td>
              </tr>
              <tr>
                <td className="bg-[#efefef] border-l border-r border-b border-black px-5 py-3 font-bold whitespace-nowrap">
                  Đã thanh toán
                </td>
                <td className="border-r border-b border-black px-5 py-3 text-right font-bold">
                  {formatCurrency(totalPaid)}
                </td>
              </tr>
              <tr>
                <td className="bg-[#efefef] border-l border-r border-b border-black px-5 py-3 font-bold whitespace-nowrap">
                  {remaining < 0 ? 'Thừa' : 'Còn lại'}
                </td>
                <td
                  className={cn(
                    'border-r border-b border-black px-5 py-3 text-right font-bold',
                    remaining > 0
                      ? 'text-red-600'
                      : remaining < 0
                        ? 'text-orange-500'
                        : 'text-green-600'
                  )}
                >
                  {formatCurrency(Math.abs(remaining))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Lưu thanh toán ───────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 mt-6 mb-10">
        <NButton
          type="button"
          className={cn(
            'w-[20rem] h-[4rem] text-[1.6rem]',
            selectedValidation.canSave ? '' : 'bg-[#efefef] text-gray-400 cursor-not-allowed'
          )}
          onClick={saveAll}
          disabled={!selectedValidation.canSave || saving}
        >
          {saving ? 'Đang lưu...' : 'Thanh toán'}
        </NButton>
        {selectedValidation.hint && (
          <span className="text-[1.3rem] text-red-500">{selectedValidation.hint}</span>
        )}
      </div>
    </section>
  )
}
