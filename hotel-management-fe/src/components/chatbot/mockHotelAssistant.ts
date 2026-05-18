export type AssistantRole = 'assistant' | 'user'

export type AssistantMessage = {
  id: string
  role: AssistantRole
  content: string
  createdAt: string
  cards?: AssistantResultCard[]
  actions?: AssistantAction[]
  error?: boolean
}

export type AssistantResultCard = {
  title: string
  description: string
  metadata: Array<{
    label: string
    value: string
    tone?: 'default' | 'success' | 'warning' | 'danger'
  }>
}

export type AssistantSuggestion = {
  id: string
  group: 'Lịch trong ngày' | 'Đặt phòng' | 'Phòng' | 'Thanh toán' | 'Khách' | 'Quy trình'
  label: string
  prompt: string
}

export type AssistantAction = {
  type: 'link'
  label: string
  href: string
}

export const assistantSuggestions: AssistantSuggestion[] = [
  {
    id: 'today-checkin',
    group: 'Lịch trong ngày',
    label: 'Check-in hôm nay',
    prompt: 'Cho tôi xem danh sách khách check-in hôm nay',
  },
  {
    id: 'today-checkout',
    group: 'Lịch trong ngày',
    label: 'Check-out hôm nay',
    prompt: 'Cho tôi xem danh sách khách check-out hôm nay',
  },
  {
    id: 'today-arrivals-departures',
    group: 'Lịch trong ngày',
    label: 'Khách đến và đi hôm nay',
    prompt: 'Hôm nay có bao nhiêu khách đến và đi?',
  },
  {
    id: 'today-arrival-summary',
    group: 'Đặt phòng',
    label: 'Tóm tắt khách đến hôm nay',
    prompt: 'Tóm tắt tình hình khách đến hôm nay',
  },
  {
    id: 'today-departure-summary',
    group: 'Đặt phòng',
    label: 'Tóm tắt khách đi hôm nay',
    prompt: 'Tóm tắt tình hình khách đi hôm nay',
  },
  {
    id: 'today-staying-guests',
    group: 'Khách',
    label: 'Khách đang lưu trú',
    prompt: 'Hiện có những khách nào đang lưu trú?',
  },
  {
    id: 'available-today',
    group: 'Phòng',
    label: 'Phòng trống hôm nay',
    prompt: 'Hôm nay còn những phòng nào có thể đặt?',
  },
  {
    id: 'available-deluxe-today',
    group: 'Phòng',
    label: 'Phòng Deluxe trống hôm nay',
    prompt: 'Hôm nay còn phòng Deluxe nào có thể đặt?',
  },
  {
    id: 'occupied-rooms',
    group: 'Phòng',
    label: 'Danh sách phòng có khách',
    prompt: 'Cho tôi xem danh sách phòng đang có khách',
  },
  {
    id: 'room-overview',
    group: 'Phòng',
    label: 'Tổng quan phòng',
    prompt: 'Cho tôi xem tổng quan danh sách phòng hiện tại',
  },
  {
    id: 'payment-guidance',
    group: 'Thanh toán',
    label: 'Quy trình đối soát thanh toán',
    prompt: 'Quy trình kiểm tra và đối soát thanh toán đặt phòng là gì?',
  },
  {
    id: 'late-payment-guidance',
    group: 'Thanh toán',
    label: 'Xử lý công nợ chưa thanh toán',
    prompt: 'Quy trình xử lý đặt phòng còn công nợ chưa thanh toán là gì?',
  },
  {
    id: 'early-checkin-policy',
    group: 'Quy trình',
    prompt: 'Tóm tắt quy trình xử lý khách đến sớm',
    label: 'Khách đến sớm',
  },
  {
    id: 'late-checkout-policy',
    group: 'Quy trình',
    label: 'Check-out muộn',
    prompt: 'Chính sách xử lý khách check-out muộn là gì?',
  },
  {
    id: 'internal-phones',
    group: 'Quy trình',
    label: 'Số nội bộ',
    prompt: 'Cho tôi số nội bộ của lễ tân, buồng phòng và kế toán',
  },
  {
    id: 'lost-found',
    group: 'Quy trình',
    label: 'Mất đồ',
    prompt: 'Quy trình xử lý khách báo mất đồ như thế nào?',
  },
  {
    id: 'cancellation-policy',
    group: 'Quy trình',
    label: 'Hủy phòng và no-show',
    prompt: 'Chính sách hủy phòng, no-show và hoàn tiền là gì?',
  },
  {
    id: 'pet-policy',
    group: 'Quy trình',
    label: 'Chính sách thú cưng',
    prompt: 'Chính sách thú cưng của khách sạn là gì?',
  },
  {
    id: 'noise-complaint',
    group: 'Quy trình',
    label: 'Khách phàn nàn tiếng ồn',
    prompt: 'Quy trình xử lý khách phàn nàn tiếng ồn như thế nào?',
  },
]

const todayCheckInCards: AssistantResultCard[] = [
  {
    title: 'BK-240518 - Nguyễn Minh Anh',
    description: 'Dự kiến đến 14:00, lưu trú 3 đêm, 2 khách.',
    metadata: [
      { label: 'Phòng', value: '502 Deluxe' },
      { label: 'Thanh toán', value: 'Đã cọc 1.000.000đ', tone: 'success' },
      { label: 'Ghi chú', value: 'Yêu cầu tầng cao' },
    ],
  },
  {
    title: 'BK-240521 - Trần Quốc Bảo',
    description: 'Dự kiến đến 16:30, lưu trú 1 đêm, 1 khách.',
    metadata: [
      { label: 'Phòng', value: '301 Standard' },
      { label: 'Thanh toán', value: 'Chưa thanh toán', tone: 'warning' },
      { label: 'Ghi chú', value: 'Xuất hóa đơn công ty' },
    ],
  },
]

const todayCheckOutCards: AssistantResultCard[] = [
  {
    title: 'BK-240417 - Lê Hoàng Nam',
    description: 'Dự kiến trả phòng 11:00, đã báo kiểm phòng trước khi hoàn tất.',
    metadata: [
      { label: 'Phòng', value: '405 Superior' },
      { label: 'Thanh toán', value: 'Đã thanh toán đủ', tone: 'success' },
      { label: 'Cần làm', value: 'Kiểm minibar và nhận lại thẻ phòng' },
    ],
  },
  {
    title: 'BK-240420 - Phạm Thu Hà',
    description: 'Dự kiến trả phòng 12:00, khách có yêu cầu gửi hành lý sau check-out.',
    metadata: [
      { label: 'Phòng', value: '207 Standard' },
      { label: 'Thanh toán', value: 'Còn 350.000đ', tone: 'warning' },
      { label: 'Cần làm', value: 'Đối soát phụ thu giặt là' },
    ],
  },
]

const bookingSummaryCards: AssistantResultCard[] = [
  {
    title: 'BK-240518 - Nguyễn Minh Anh',
    description: 'Booking đang ở trạng thái đã xác nhận. Khách check-in 18/05, check-out 21/05.',
    metadata: [
      { label: 'Loại phòng', value: 'Deluxe' },
      { label: 'Phòng gán', value: '502' },
      { label: 'Tổng tiền', value: '3.600.000đ' },
      { label: 'Còn lại', value: '2.600.000đ', tone: 'warning' },
    ],
  },
]

const availableRoomCards: AssistantResultCard[] = [
  {
    title: 'Deluxe còn 3 phòng',
    description: 'Các phòng phù hợp trong ngày 18/05, ưu tiên phòng đã dọn sạch.',
    metadata: [
      { label: 'Sẵn sàng', value: '502, 508', tone: 'success' },
      { label: 'Đang dọn', value: '506', tone: 'warning' },
      { label: 'Không khả dụng', value: '504 đang sửa', tone: 'danger' },
    ],
  },
]

const paymentCards: AssistantResultCard[] = [
  {
    title: 'Thanh toán BK-240518',
    description: 'Booking đã có tiền cọc, chưa đủ điều kiện đóng công nợ.',
    metadata: [
      { label: 'Tổng tiền', value: '3.600.000đ' },
      { label: 'Đã thu', value: '1.000.000đ', tone: 'success' },
      { label: 'Còn lại', value: '2.600.000đ', tone: 'warning' },
    ],
  },
]

const policyCards: AssistantResultCard[] = [
  {
    title: 'Khách đến sớm',
    description:
      'Kiểm tra tình trạng phòng, xác nhận phí early check-in, cập nhật ghi chú nội bộ và báo buồng phòng ưu tiên.',
    metadata: [
      { label: 'Trước 09:00', value: 'Tính 50% giá ngày' },
      { label: '09:00-12:00', value: 'Tính 30% giá ngày' },
      { label: 'Số nội bộ', value: 'Lễ tân 101, Buồng phòng 202' },
    ],
  },
]

const roomStatusCards: AssistantResultCard[] = [
  {
    title: 'Tình trạng phòng hiện tại',
    description: 'Mock dữ liệu theo trạng thái vận hành trong ngày.',
    metadata: [
      { label: 'Đang trống', value: '18 phòng', tone: 'success' },
      { label: 'Có khách', value: '42 phòng' },
      { label: 'Đang dọn', value: '7 phòng', tone: 'warning' },
      { label: 'Bảo trì', value: '2 phòng', tone: 'danger' },
    ],
  },
]

const guestHistoryCards: AssistantResultCard[] = [
  {
    title: 'Lịch sử lưu trú - Nguyễn Minh Anh',
    description: 'Khách đã lưu trú 4 lần, không có cảnh báo nghiệp vụ.',
    metadata: [
      { label: 'Gần nhất', value: '12/04-15/04, phòng 506' },
      { label: 'Tổng đêm', value: '11 đêm' },
      { label: 'Ưu tiên', value: 'Phòng tầng cao, ít tiếng ồn' },
    ],
  },
]

const fallbackCards: AssistantResultCard[] = [
  {
    title: 'Gợi ý tra cứu',
    description:
      'Bạn có thể hỏi về booking, khách lưu trú, phòng trống, trạng thái thanh toán, quy trình hoặc số nội bộ.',
    metadata: [
      { label: 'Ví dụ', value: 'Tìm booking theo tên Nguyễn Minh Anh' },
      { label: 'Ví dụ', value: 'Phòng 502 hiện trạng thái gì?' },
      { label: 'Ví dụ', value: 'Quy trình xử lý khách phàn nàn tiếng ồn' },
    ],
  },
]

function createAssistantMessage(content: string, cards: AssistantResultCard[]): AssistantMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
    cards,
  }
}

export function getMockAssistantResponse(prompt: string): Promise<AssistantMessage> {
  const normalizedPrompt = prompt.toLowerCase()

  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (normalizedPrompt.includes('check-out')) {
        resolve(
          createAssistantMessage(
            'Tôi tìm thấy 2 booking check-out hôm nay cần hoàn tất.',
            todayCheckOutCards
          )
        )
        return
      }

      if (normalizedPrompt.includes('check-in') || normalizedPrompt.includes('hôm nay')) {
        resolve(
          createAssistantMessage(
            'Tôi tìm thấy 2 booking check-in hôm nay cần lễ tân chú ý.',
            todayCheckInCards
          )
        )
        return
      }

      if (normalizedPrompt.includes('thanh toán') || normalizedPrompt.includes('cong no')) {
        resolve(
          createAssistantMessage('Đây là trạng thái thanh toán hiện tại của booking.', paymentCards)
        )
        return
      }

      if (normalizedPrompt.includes('phòng trống') || normalizedPrompt.includes('deluxe')) {
        resolve(
          createAssistantMessage(
            'Tôi lọc được nhóm phòng trống theo loại phòng và ngày bạn yêu cầu.',
            availableRoomCards
          )
        )
        return
      }

      if (
        normalizedPrompt.includes('trạng thái phòng') ||
        normalizedPrompt.includes('đang dọn') ||
        normalizedPrompt.includes('có khách')
      ) {
        resolve(
          createAssistantMessage(
            'Đây là tổng hợp trạng thái phòng theo dữ liệu mock.',
            roomStatusCards
          )
        )
        return
      }

      if (normalizedPrompt.includes('lịch sử') || normalizedPrompt.includes('lưu trú')) {
        resolve(
          createAssistantMessage(
            'Tôi tìm thấy lịch sử lưu trú phù hợp với tên khách.',
            guestHistoryCards
          )
        )
        return
      }

      if (
        normalizedPrompt.includes('quy trình') ||
        normalizedPrompt.includes('chính sách') ||
        normalizedPrompt.includes('số nội bộ')
      ) {
        resolve(createAssistantMessage('Đây là tóm tắt tài liệu nội bộ liên quan.', policyCards))
        return
      }

      if (normalizedPrompt.includes('booking') || normalizedPrompt.includes('bk-')) {
        resolve(
          createAssistantMessage(
            'Tôi tìm thấy booking khớp với thông tin tra cứu.',
            bookingSummaryCards
          )
        )
        return
      }

      resolve(
        createAssistantMessage(
          'Tôi chưa có dữ liệu mock khớp hoàn toàn, dưới đây là các hướng tra cứu đang hỗ trợ.',
          fallbackCards
        )
      )
    }, 500)
  })
}
