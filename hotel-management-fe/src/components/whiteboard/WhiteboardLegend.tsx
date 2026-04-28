import { useTranslation } from 'react-i18next'

const LEGEND = [
  { key: 'inUse', color: '#37A86B' },
  { key: 'reserved', color: '#79A3E0' },
  { key: 'draft', color: '#999999' },
  { key: 'rakuten', color: '#BF0000' },
]

export function WhiteboardLegend() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-4 items-center text-[1.2rem]">
      {LEGEND.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
          <span>{t(`whiteboard.legend.${item.key}`)}</span>
        </div>
      ))}
    </div>
  )
}
