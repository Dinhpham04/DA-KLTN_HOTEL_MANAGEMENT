import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const footerLinks = [
  { key: 'dashboard', label: 'nav.dashboard', href: '/dashboard' },
  { key: 'reservations', label: 'nav.reservations', href: '/reservations' },
  { key: 'rooms', label: 'nav.rooms', href: '/rooms' },
  { key: 'clients', label: 'nav.clients', href: '/clients' },
  { key: 'billing', label: 'nav.billing', href: '/billing' },
  { key: 'cleaning', label: 'nav.cleaning', href: '/cleaning' },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer>
      <ul className="flex flex-wrap bg-white py-[2.2rem] pl-32">
        {footerLinks.map((item) => (
          <li
            key={item.key}
            className="mb-4 lg:mb-0 pr-6 mr-6 border-r border-[#204172]/30 last:border-r-0"
          >
            <Link
              to={item.href}
              className="block text-[1.3rem] font-bold leading-[1.2rem] text-[#204172] hover:opacity-70 transition-opacity"
            >
              {t(item.label)}
            </Link>
          </li>
        ))}
      </ul>
      <div className="bg-[#E7EBF0] py-[1.5rem] pl-32 text-[1.4rem] font-normal leading-[1rem]">
        {t('common.appName')}
      </div>
    </footer>
  )
}
