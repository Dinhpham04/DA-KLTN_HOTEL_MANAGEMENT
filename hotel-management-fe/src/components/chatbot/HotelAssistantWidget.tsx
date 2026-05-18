import {
  type HotelAssistantPageContext,
  sendHotelAssistantMessage,
} from '@/api/hotel-assistant.api'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Bot,
  ExternalLink,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  type AssistantMessage,
  type AssistantResultCard,
  assistantSuggestions,
} from './mockHotelAssistant'

const assistantSessionStorageKey = 'hotel_assistant_session_id'
const assistantSuggestionGroups = Array.from(
  new Set(assistantSuggestions.map((suggestion) => suggestion.group))
)

function createInitialMessages(): AssistantMessage[] {
  return [
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content:
        'Xin chào, tôi là trợ lý tra cứu nghiệp vụ khách sạn. Bạn có thể hỏi về booking, phòng, thanh toán, lưu trú hoặc tài liệu nội bộ.',
      createdAt: new Date().toISOString(),
    },
  ]
}

const toneClassName: Record<
  NonNullable<AssistantResultCard['metadata'][number]['tone']>,
  string
> = {
  default: 'bg-white text-slate-700 border-slate-200',
  success: 'bg-slate-50 text-slate-700 border-slate-200',
  warning: 'bg-stone-50 text-stone-700 border-stone-200',
  danger: 'bg-zinc-50 text-zinc-700 border-zinc-200',
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getSessionId() {
  const currentSessionId = localStorage.getItem(assistantSessionStorageKey)
  if (currentSessionId) return currentSessionId

  const nextSessionId = createSessionId()
  localStorage.setItem(assistantSessionStorageKey, nextSessionId)
  return nextSessionId
}

function createSessionId() {
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getCurrentStaffId() {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) return 'web'

  try {
    const user = JSON.parse(storedUser) as { staffId?: unknown }
    return typeof user.staffId === 'number' || typeof user.staffId === 'string'
      ? user.staffId
      : 'web'
  } catch {
    return 'web'
  }
}

function getPageContext(): HotelAssistantPageContext {
  const url = `${window.location.pathname}${window.location.search}`
  const reservationMatch = window.location.pathname.match(/\/reservations\/(\d+)\/([^/]+)/)
  const reserveId = reservationMatch ? Number(reservationMatch[1]) : undefined
  const screen = reservationMatch ? `reservation_${reservationMatch[2]}` : undefined

  return {
    url,
    screen,
    reserveId: Number.isFinite(reserveId) ? reserveId : undefined,
  }
}

function ResultCard({ card }: { card: AssistantResultCard }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <h4 className="text-[1.45rem] font-semibold text-slate-950 leading-6">{card.title}</h4>
      <p className="mt-1.5 text-[1.3rem] text-slate-600 leading-6">{card.description}</p>
      <div className="mt-4 grid gap-2">
        {card.metadata.map((item) => (
          <div
            className={cn(
              'flex items-start justify-between gap-4 rounded-md border px-3.5 py-2.5 text-[1.25rem]',
              toneClassName[item.tone ?? 'default']
            )}
            key={`${card.title}-${item.label}-${item.value}`}
          >
            <span className="font-medium whitespace-nowrap">{item.label}</span>
            <span className="text-right leading-5">{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, ...props }) => (
          <a
            {...props}
            className="font-medium text-[#204172] underline underline-offset-2"
            rel="noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-slate-300 border-l-2 pl-4 text-slate-600">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[1.25rem] text-slate-800">
            {children}
          </code>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 pl-6">{children}</ol>,
        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
        pre: ({ children }) => (
          <pre className="my-3 overflow-x-auto rounded-md bg-slate-100 p-3 text-[1.25rem]">
            {children}
          </pre>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-950">{children}</strong>
        ),
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[1.25rem]">{children}</table>
          </div>
        ),
        td: ({ children }) => <td className="border border-slate-200 px-3 py-2">{children}</td>,
        th: ({ children }) => (
          <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold">
            {children}
          </th>
        ),
        ul: ({ children }) => <ul className="my-3 list-disc space-y-2 pl-6">{children}</ul>,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  )
}

function ChatMessage({ message }: { message: AssistantMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-[#204172] shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn('max-w-[89%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'whitespace-pre-line rounded-md px-5 py-3.5 text-[1.4rem] leading-7 shadow-[0_8px_24px_rgba(15,23,42,0.05)]',
            isUser && 'bg-slate-900 text-white',
            !isUser && !message.error && 'border border-slate-200 bg-white text-slate-800',
            message.error && 'border border-stone-200 bg-stone-50 text-stone-800'
          )}
        >
          {isUser ? message.content : <AssistantMarkdown content={message.content} />}
        </div>
        {message.cards && message.cards.length > 0 && (
          <div className="mt-2 grid gap-2">
            {message.cards.map((card) => (
              <ResultCard card={card} key={card.title} />
            ))}
          </div>
        )}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <a
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[1.2rem] text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                href={action.href}
                key={`${action.label}-${action.href}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {action.label}
              </a>
            ))}
          </div>
        )}
        <span className="mt-1 block text-[1.05rem] text-slate-400">
          {formatTime(message.createdAt)}
        </span>
      </div>
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm">
          <UserRound className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

export function HotelAssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>(createInitialMessages)
  const [inputValue, setInputValue] = useState('')
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>()
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string>(getSessionId())

  const canSend = useMemo(
    () => inputValue.trim().length > 0 && !isThinking,
    [inputValue, isThinking]
  )

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  })

  const sendPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt || isThinking) return

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedPrompt,
      createdAt: new Date().toISOString(),
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInputValue('')
    setIsThinking(true)

    try {
      const assistantMessage = await sendHotelAssistantMessage({
        message: trimmedPrompt,
        sessionId: sessionIdRef.current,
        staffId: getCurrentStaffId(),
        facilityId: 'default',
        pageContext: getPageContext(),
      })
      setMessages((currentMessages) => [...currentMessages, assistantMessage])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSend) return
    void sendPrompt(inputValue)
  }

  const handleSuggestionChange = (suggestionId: string) => {
    const suggestion = assistantSuggestions.find((item) => item.id === suggestionId)
    if (!suggestion) return

    setSelectedSuggestionId(suggestionId)
    void sendPrompt(suggestion.prompt)
    setSelectedSuggestionId(undefined)
  }

  const startNewConversation = () => {
    if (isThinking) return

    const nextSessionId = createSessionId()
    localStorage.setItem(assistantSessionStorageKey, nextSessionId)
    sessionIdRef.current = nextSessionId
    setMessages(createInitialMessages())
    setInputValue('')
  }

  return (
    <div className="fixed right-6 bottom-6 z-[10040] flex items-end gap-4 text-[1.4rem]">
      {open && (
        <section
          aria-label="Chatbot trợ lý khách sạn"
          className="flex h-[78rem] max-h-[calc(100vh-3rem)] w-[54rem] max-w-[calc(100vw-11rem)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-[#f8fafc] shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
        >
          <header className="flex items-center justify-between gap-4 border-slate-200 border-b bg-white px-6 py-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-white text-[#204172] shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[1.7rem] text-slate-950 leading-7">
                  Trợ lý AI khách sạn
                </h3>
                <div className="mt-1 flex items-center gap-2 text-[1.2rem] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                  <span>Chỉ tra cứu</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Tạo cuộc trò chuyện mới"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isThinking}
                onClick={startNewConversation}
                title="Tạo cuộc trò chuyện mới"
                type="button"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
              <button
                aria-label="Đóng chatbot"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="border-slate-200 border-b bg-white px-6 py-5">
            <Select
              disabled={isThinking}
              onValueChange={handleSuggestionChange}
              value={selectedSuggestionId}
            >
              <SelectTrigger className="h-12 rounded-md border-slate-200 pr-0 pl-4 text-slate-700 hover:bg-slate-50">
                <SelectValue placeholder="Chọn câu hỏi thường dùng" />
              </SelectTrigger>
              <SelectContent className="z-[10060] max-h-[34rem] border-slate-200">
                {assistantSuggestionGroups.map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel className="px-3 py-2 text-[1.15rem] text-slate-500">
                      {group}
                    </SelectLabel>
                    {assistantSuggestions
                      .filter((suggestion) => suggestion.group === group)
                      .map((suggestion) => (
                        <SelectItem
                          className="py-2.5 pr-4 pl-8 text-[1.3rem]"
                          key={suggestion.id}
                          value={suggestion.id}
                        >
                          {suggestion.label}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6" ref={scrollRef}>
            <div className="grid gap-5">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-[1.25rem] text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang gọi workflow n8n...</span>
                </div>
              )}
            </div>
          </div>

          <form className="border-slate-200 border-t bg-white p-5" onSubmit={handleSubmit}>
            <div className="flex items-end gap-3">
              <textarea
                className="max-h-36 min-h-[5.6rem] flex-1 resize-none rounded-md border border-slate-300 bg-white px-5 py-3.5 text-[1.4rem] leading-7 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    if (canSend) void sendPrompt(inputValue)
                  }
                }}
                placeholder="Nhập nội dung cần tra cứu..."
                rows={1}
                value={inputValue}
              />
              <button
                aria-label="Gửi câu hỏi"
                className="flex h-[5.6rem] w-[5.6rem] shrink-0 items-center justify-center rounded-md bg-slate-900 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canSend}
                type="submit"
              >
                {isThinking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        aria-label={open ? 'Ẩn chatbot AI' : 'Mở chatbot AI'}
        className={cn(
          'flex h-[5.8rem] w-[5.8rem] shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition-colors hover:bg-slate-700',
          open && 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100'
        )}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        type="button"
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  )
}
