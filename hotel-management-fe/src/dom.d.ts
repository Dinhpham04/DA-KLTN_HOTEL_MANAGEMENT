interface AlertDetail {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

interface GlobalEventHandlersEventMap {
  displayalert: CustomEvent<AlertDetail>
}

type Range<T> = [T, T]

export type Detail = 'hour' | 'minute' | 'second'

type LooseValuePiece = string | Date | null

export type LooseValue = LooseValuePiece | Range<LooseValuePiece>
