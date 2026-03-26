function isString(text: unknown): text is string {
  return typeof text === 'string' || text instanceof String
}

export function parseString(text: unknown, fieldName = 'text'): string {
  if (!text || !isString(text)) {
    throw new Error(`Incorrect or missing ${fieldName}.`)
  }

  return text
}

export function parseInteger(number: unknown, fieldName = 'number'): number {
  if (typeof number === 'number') return number
  if (!number || typeof number !== 'string') {
    throw new Error(`${fieldName} is empty or is not a type that can be converted`)
  }
  const parseResult = Number.parseInt(number)
  if (!Number.isFinite(parseResult)) {
    throw new Error(`Cannot parse ${fieldName} into integer`)
  }
  return parseResult
}

export function calculateAge(birthday: string): number | string {
  const regex = /^\d{4}[\/-]\d{2}[\/-]\d{2}$/

  if (!regex.test(birthday)) {
    return 'XX'
  }

  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function isEmpty(value: string | number | null | undefined | object | unknown[]): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
  )
}

export function safeParseBoolean(boolean: unknown): boolean {
  if (typeof boolean === 'boolean') {
    return boolean
  }
  if (typeof boolean === 'string' && boolean.toLocaleLowerCase() === 'true') {
    return true
  }
  if (typeof boolean === 'number' && boolean === 1) {
    return true
  }
  return false
}

export function formatMoney(number: number): string {
  const isNegative = number < 0
  const absoluteNumber = Math.abs(number)
  const formattedNumber = absoluteNumber.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return isNegative ? `-${formattedNumber}` : formattedNumber
}
