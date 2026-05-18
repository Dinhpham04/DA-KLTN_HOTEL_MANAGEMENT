import { useTranslation } from 'react-i18next'

const LEGEND = [
  { key: 'draft', kind: 'solid', color: '#000000' },
  { key: 'pending', kind: 'solid', color: '#8BD08E' },
  { key: 'confirmed', kind: 'solid', color: '#FCFF61' },
  { key: 'checkedIn', kind: 'solid', color: '#F86F6F' },
  { key: 'checkedOut', kind: 'solid', color: '#D1D5DB' },
  { key: 'paddingBlocked', kind: 'pattern' },
  { key: 'available', kind: 'available' },
] as const

export function WhiteboardLegend() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-4 items-center text-[1.2rem]">
      {LEGEND.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <span
            className="inline-block border border-[#9CA3AF] rounded w-4 h-4"
            style={
              item.kind === 'solid'
                ? { backgroundColor: item.color }
                : item.kind === 'pattern'
                  ? {
                      backgroundImage:
                        'repeating-linear-gradient(45deg, #D1D5DB 0, #D1D5DB 4px, #E5E7EB 4px, #E5E7EB 8px)',
                    }
                  : { backgroundColor: '#FFFFFF' }
            }
          />
          <span>{t(`whiteboard.legend.${item.key}`)}</span>
        </div>
      ))}
    </div>
  )
}
