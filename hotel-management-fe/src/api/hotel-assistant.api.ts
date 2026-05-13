import type {
  AssistantAction,
  AssistantMessage,
  AssistantResultCard,
} from '@/components/chatbot/mockHotelAssistant'
import { env } from '@/config/env'

type AssistantTone = 'default' | 'success' | 'warning' | 'danger'

type N8nChatbotField = {
  label?: unknown
  value?: unknown
  tone?: unknown
}

type N8nChatbotCard = {
  title?: unknown
  subtitle?: unknown
  description?: unknown
  fields?: unknown
}

type N8nChatbotAction = {
  type?: unknown
  label?: unknown
  href?: unknown
}

type N8nChatbotResponse = {
  answer?: unknown
  cards?: unknown
  actions?: unknown
}

export type HotelAssistantPageContext = {
  url: string
  screen?: string
  reserveId?: number
}

export type SendHotelAssistantMessageParams = {
  message: string
  sessionId: string
  staffId: number | string
  facilityId: number | string
  pageContext: HotelAssistantPageContext
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asTone(value: unknown): AssistantTone {
  return value === 'success' || value === 'warning' || value === 'danger' ? value : 'default'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mapCards(cards: unknown): AssistantResultCard[] {
  if (!Array.isArray(cards)) return []

  return cards.filter(isRecord).map((card): AssistantResultCard => {
    const n8nCard = card as N8nChatbotCard
    const fields = Array.isArray(n8nCard.fields) ? n8nCard.fields : []

    return {
      title: asString(n8nCard.title, 'Kết quả tra cứu'),
      description: asString(n8nCard.subtitle) || asString(n8nCard.description),
      metadata: fields.filter(isRecord).map((field): AssistantResultCard['metadata'][number] => {
        const n8nField = field as N8nChatbotField
        return {
          label: asString(n8nField.label, 'Thông tin'),
          value: asString(n8nField.value, '-'),
          tone: asTone(n8nField.tone),
        }
      }),
    }
  })
}

function mapActions(actions: unknown): AssistantAction[] {
  if (!Array.isArray(actions)) return []

  return actions.filter(isRecord).flatMap((action): AssistantAction[] => {
    const n8nAction = action as N8nChatbotAction
    const type = asString(n8nAction.type)
    const label = asString(n8nAction.label)
    const href = asString(n8nAction.href)

    if (type !== 'link' || !label || !href) return []

    return [{ type: 'link', label, href }]
  })
}

function createErrorMessage(error: unknown): AssistantMessage {
  const message = error instanceof Error ? error.message : 'Không rõ lỗi'

  return {
    id: `assistant-error-${Date.now()}`,
    role: 'assistant',
    content: `Không gọi được workflow n8n.\n\nChi tiết: ${message}`,
    createdAt: new Date().toISOString(),
    error: true,
  }
}

export async function sendHotelAssistantMessage(
  params: SendHotelAssistantMessageParams
): Promise<AssistantMessage> {
  try {
    const response = await fetch(env.n8nChatbotWebhookUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as N8nChatbotResponse

    return {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: asString(data.answer, 'Workflow chưa trả về câu trả lời.'),
      createdAt: new Date().toISOString(),
      cards: mapCards(data.cards),
      actions: mapActions(data.actions),
    }
  } catch (error) {
    return createErrorMessage(error)
  }
}
