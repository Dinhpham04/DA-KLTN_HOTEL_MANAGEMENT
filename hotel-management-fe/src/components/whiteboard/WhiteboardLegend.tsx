import { useTranslation } from 'react-i18next'

const LEGEND = [
  { key: 'unconfirmed', color: '#8BD08E' },
  { key: 'confirmed', color: '#FCFF61' },
  { key: 'corporate', color: '#F86F6F' },
  { key: 'advertising', color: '#4ADEDE' },
  { key: 'draft', color: '#000000' },
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
