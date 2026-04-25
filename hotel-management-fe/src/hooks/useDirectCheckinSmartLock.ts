import dayjs from 'dayjs'
import { useCallback, useEffect } from 'react'
import type { FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import {
  generateSmartLockPin,
  resolveSmartLockValidFrom,
  resolveSmartLockValidTo,
} from '@/lib/smart-lock-directcheckin'

type DirectCheckinFieldMap = {
  'reserve.directcheckin_note': string
  'reserve.smart_lock_pin': string
  'reserve.smart_lock_valid_from': string
  'reserve.smart_lock_valid_to': string
  'reserve.di_contact_staff_id': string
  'reserve.contacted_flag': boolean
  'reserve.checkin_date': string
  'reserve.directcheckin_flag': boolean
  'reserve.directcheckin_type': string
}

type ReservationDirectCheckinShape = {
  reserve: {
    directcheckin_note?: string
    smart_lock_pin?: string
    smart_lock_valid_from?: string
    smart_lock_valid_to?: string
    di_contact_staff_id?: string
    contacted_flag?: boolean
    checkin_date?: string
    directcheckin_flag?: boolean
    directcheckin_type?: string
  }
}

type UseDirectCheckinSmartLockParams<
  TFormValues extends FieldValues & ReservationDirectCheckinShape,
> = {
  getValues: UseFormGetValues<TFormValues>
  setValue: UseFormSetValue<TFormValues>
  periodFrom?: string
  periodTo?: string
  checkinTime?: string
  directcheckinFlag?: boolean
  directcheckinType?: string
}

export function useDirectCheckinSmartLock<
  TFormValues extends FieldValues & ReservationDirectCheckinShape,
>({
  getValues,
  setValue,
  periodFrom,
  periodTo,
  checkinTime,
  directcheckinFlag,
  directcheckinType,
}: UseDirectCheckinSmartLockParams<TFormValues>) {
  const setField = useCallback(
    <K extends keyof DirectCheckinFieldMap>(name: K, value: DirectCheckinFieldMap[K]) => {
      setValue(name as never, value as never)
    },
    [setValue]
  )

  const getField = useCallback(
    <K extends keyof DirectCheckinFieldMap>(name: K): DirectCheckinFieldMap[K] => {
      return getValues(name as never) as unknown as DirectCheckinFieldMap[K]
    },
    [getValues]
  )

  const clearDirectcheckinDetails = useCallback(() => {
    setField('reserve.directcheckin_note', '')
    setField('reserve.smart_lock_pin', '')
    setField('reserve.smart_lock_valid_from', '')
    setField('reserve.smart_lock_valid_to', '')
    setField('reserve.di_contact_staff_id', '')
    setField('reserve.contacted_flag', false)
    setField('reserve.checkin_date', '')
  }, [setField])

  const ensureSmartLockDefaults = useCallback(() => {
    if (!getField('reserve.smart_lock_pin')) {
      setField('reserve.smart_lock_pin', generateSmartLockPin())
    }

    if (!getField('reserve.smart_lock_valid_from')) {
      const defaultValidFrom = resolveSmartLockValidFrom({
        periodFrom,
        checkinTime,
      })
      if (defaultValidFrom) {
        setField('reserve.smart_lock_valid_from', defaultValidFrom)
      }
    }

    if (!getField('reserve.smart_lock_valid_to')) {
      const defaultValidTo = resolveSmartLockValidTo({ periodTo })
      if (defaultValidTo) {
        setField('reserve.smart_lock_valid_to', defaultValidTo)
      }
    }
  }, [checkinTime, getField, periodFrom, periodTo, setField])

  const syncDirectcheckinFlagByType = useCallback(
    (type: string) => {
      const isSelfCheckin = type === '2'
      setField('reserve.directcheckin_flag', isSelfCheckin)

      if (isSelfCheckin) {
        ensureSmartLockDefaults()
        return
      }

      clearDirectcheckinDetails()
    },
    [clearDirectcheckinDetails, ensureSmartLockDefaults, setField]
  )

  const toggleDirectcheckinFlag = useCallback(
    (checked: boolean) => {
      setField('reserve.directcheckin_flag', checked)

      if (checked) {
        setField('reserve.directcheckin_type', '2')
        ensureSmartLockDefaults()
        return
      }

      setField('reserve.directcheckin_type', '1')
      clearDirectcheckinDetails()
    },
    [clearDirectcheckinDetails, ensureSmartLockDefaults, setField]
  )

  const handleContactedFlagChange = useCallback(
    (checked: boolean, onChange: (value: boolean) => void) => {
      onChange(checked)

      if (checked) {
        if (!getField('reserve.checkin_date')) {
          setField('reserve.checkin_date', dayjs().format('YYYY-MM-DD HH:mm'))
        }
        return
      }

      setField('reserve.checkin_date', '')
    },
    [getField, setField]
  )

  useEffect(() => {
    if (!directcheckinFlag || directcheckinType !== '2') return
    ensureSmartLockDefaults()
  }, [directcheckinFlag, directcheckinType, ensureSmartLockDefaults])

  return {
    syncDirectcheckinFlagByType,
    toggleDirectcheckinFlag,
    handleContactedFlagChange,
  }
}
