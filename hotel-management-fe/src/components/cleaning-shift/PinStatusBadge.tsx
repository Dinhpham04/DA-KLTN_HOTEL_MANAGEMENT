import { Badge } from '@/components/ui/badge'
import { type PinInfo, PinStatus } from '@/types/cleaning-shift'

interface Props {
  pinInfo: PinInfo | null | undefined
}

export function PinStatusBadge({ pinInfo }: Props) {
  if (!pinInfo) {
    return <Badge className="bg-slate-200 text-slate-800">Chưa có PIN</Badge>
  }
  if (pinInfo.status === PinStatus.REVOKED) {
    return <Badge className="bg-slate-400 text-white">Đã hủy</Badge>
  }
  if (pinInfo.status === PinStatus.EXPIRED) {
    return <Badge className="bg-amber-200 text-amber-900">Hết hạn</Badge>
  }
  if (pinInfo.revokedOk) {
    return <Badge className="bg-amber-200 text-amber-900">Hết hạn</Badge>
  }
  return <Badge className="bg-emerald-500 text-white">Đang hoạt động</Badge>
}
