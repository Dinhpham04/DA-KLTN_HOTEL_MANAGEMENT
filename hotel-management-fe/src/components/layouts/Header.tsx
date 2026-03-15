import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Hotel, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { DashboardIcon } from '@/components/svgs/DashboardIcon'
import { ReservationIcon } from '@/components/svgs/ReservationIcon'
import { RoomIcon } from '@/components/svgs/RoomIcon'
import { SearchIconSvg } from '@/components/svgs/SearchIconSvg'
import { MenuIcon } from '@/components/svgs/MenuIcon'
import { CloseIcon } from '@/components/svgs/CloseIcon'

interface MenuChild {
  id: number
  url: string
  menu_children: string
}

interface MenuItem {
  id: number
  item?: string
  url?: string
  children?: MenuChild[]
  onClick?: () => void
}

export function Header() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const headerRef = useRef<HTMLElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drawerStyles, setDrawerStyles] = useState({
    top: '80px',
    height: 'calc(100vh - 80px)',
  })

  const handleLogout = async () => {
    handleDrawerClose()
    await logout.mutateAsync()
    navigate({ to: '/login' })
  }

  const menuList: MenuItem[] = [
    { id: 1, item: t('nav.dashboard'), url: '/dashboard' },
    { id: 2, item: t('nav.reservations'), url: '/reservations' },
    { id: 3, item: t('nav.rooms'), url: '/rooms' },
    { id: 4, item: t('nav.clients'), url: '/clients' },
    { id: 5, item: t('nav.billing'), url: '/billing' },
    { id: 6, item: t('nav.cleaning'), url: '/cleaning' },
    { id: 12, item: t('auth.logout'), onClick: handleLogout },
  ]

  const handleClick = (id: string) => {
    const isOpenMenu = (id === activeId ? null : id) === 'menu'
    if (isOpenMenu && headerRef.current) {
      const top = headerRef.current.clientHeight
      setDrawerStyles({
        top: `${top}px`,
        height: `calc(100vh - ${top}px)`,
      })
    }
    setActiveId(id === activeId ? null : id)
  }

  const handleDrawerClose = () => {
    setActiveId(null)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: close drawer on route change
  useEffect(() => {
    if (activeId) {
      handleDrawerClose()
      document.getElementById('open-side-bar-trigger')?.click()
    }
  }, [location.pathname])

  return (
    <header
      className="top-0 z-[99] sticky bg-[#3764A8] pt-6 pr-6 pb-2 pl-[2.375rem]"
      ref={headerRef}
    >
      <div className="flex justify-between">
        {/* LEFT: Logo + App name + User info */}
        <div className="flex flex-col justify-start items-center">
          <Link to="/dashboard">
            <div className="flex items-center">
              <div className="mr-[1.621rem] h-16 flex items-center">
                <Hotel size={40} className="text-white" />
              </div>
              <div className="flex flex-col">
                <div className="h-[2.8rem] flex items-center">
                  <span className="text-[2rem] font-bold text-white tracking-wider">
                    {t('common.appName')}
                  </span>
                </div>
                {/* <span className="text-[1.3rem] text-white leading-[1.8rem]">
                  {t('common.appName')}
                </span> */}
              </div>
            </div>
          </Link>
          {user && (
            <span className="mt-2 ml-[4.675rem] text-[1.3rem] text-white leading-[1.8rem]">
              {t('header.loggedInAs', { name: user.staffName })}
            </span>
          )}
        </div>

        {/* RIGHT: Quick-access buttons (grid 5 columns) */}
        <div className="justify-center items-center gap-[3rem] grid grid-cols-5 mr-[2rem]">
          {/* Dashboard button */}
          <Drawer direction="right">
            <div className="flex flex-col justify-center items-center gap-2">
              <div
                className={`h-20 w-20 cursor-pointer border rounded-[0.4rem] flex items-center justify-center ${location.pathname === '/dashboard'
                  ? 'bg-[#666666]'
                  : 'bg-[#204172]'
                  }`}
                onClick={() => navigate({ to: '/dashboard' })}
              >
                <DashboardIcon
                  className={
                    location.pathname === '/dashboard'
                      ? 'text-[#666666]'
                      : 'text-white'
                  }
                />
              </div>
              <div
                className={cn(
                  'font-bold text-[1.2rem]',
                  location.pathname === '/dashboard'
                    ? 'text-gray-400'
                    : 'text-white',
                )}
              >
                {t('nav.dashboard')}
              </div>
            </div>
          </Drawer>

          {/* Reservations button */}
          <Drawer direction="right">
            <div className="flex flex-col justify-center items-center gap-2">
              <div
                className={`h-20 w-20 cursor-pointer border rounded-[0.4rem] flex items-center justify-center ${location.pathname === '/reservations'
                  ? 'bg-[#666666]'
                  : 'bg-[#204172]'
                  }`}
                onClick={() => navigate({ to: '/reservations' })}
              >
                <ReservationIcon
                  className={
                    location.pathname === '/reservations'
                      ? 'text-[#666666]'
                      : 'text-white'
                  }
                />
              </div>
              <div
                className={cn(
                  'font-bold text-[1.2rem]',
                  location.pathname === '/reservations'
                    ? 'text-gray-400'
                    : 'text-white',
                )}
              >
                {t('nav.reservations')}
              </div>
            </div>
          </Drawer>

          {/* Rooms button */}
          <Drawer direction="right">
            <div className="flex flex-col justify-center items-center gap-2">
              <div
                className={`h-20 w-20 cursor-pointer border rounded-[0.4rem] flex items-center justify-center ${location.pathname === '/rooms'
                  ? 'bg-[#666666]'
                  : 'bg-[#204172]'
                  }`}
                onClick={() => navigate({ to: '/rooms' })}
              >
                <RoomIcon
                  className={
                    location.pathname === '/rooms'
                      ? 'text-[#666666]'
                      : 'text-white'
                  }
                />
              </div>
              <div
                className={cn(
                  'font-bold text-[1.2rem]',
                  location.pathname === '/rooms'
                    ? 'text-gray-400'
                    : 'text-white',
                )}
              >
                {t('nav.rooms')}
              </div>
            </div>
          </Drawer>

          {/* Clients button */}
          <Drawer direction="right">
            <div className="flex flex-col justify-center items-center gap-2">
              <div
                className={`h-20 w-20 cursor-pointer border rounded-[0.4rem] flex items-center justify-center ${location.pathname === '/clients'
                  ? 'bg-[#666666]'
                  : 'bg-[#204172]'
                  }`}
                onClick={() => navigate({ to: '/clients' })}
              >
                <SearchIconSvg
                  className={
                    location.pathname === '/clients'
                      ? 'text-[#666666]'
                      : 'text-white'
                  }
                />
              </div>
              <div
                className={cn(
                  'font-bold text-[1.2rem]',
                  location.pathname === '/clients'
                    ? 'text-gray-400'
                    : 'text-white',
                )}
              >
                {t('nav.clients')}
              </div>
            </div>
          </Drawer>

          {/* Menu hamburger button + Drawer */}
          <Drawer direction="right" onClose={handleDrawerClose}>
            <div className="flex flex-col justify-center items-center gap-2">
              <DrawerTrigger className="flex justify-center items-start h-full">
                <div
                  className={`h-20 w-20 cursor-pointer border rounded-[0.4rem] flex items-center justify-center ${activeId === 'menu' ? 'bg-[#666666]' : 'bg-[#204172]'
                    }`}
                  id="open-side-bar-trigger"
                  onClick={() => handleClick('menu')}
                >
                  {activeId === 'menu' ? (
                    <CloseIcon className="text-white" />
                  ) : (
                    <MenuIcon />
                  )}
                </div>
              </DrawerTrigger>
              <DrawerContent
                className="top-32 right-0 bottom-[unset] left-[unset] bg-[#3764A8] mt-0 pt-[3.2rem] pr-[1.5rem] pb-[3.2rem] pl-[2.9rem] border-none rounded-none w-full max-w-[27.9rem] h-[calc(100vh_-_8rem)] overflow-x-hidden overflow-y-auto"
                style={drawerStyles}
              >
                <Accordion
                  type="single"
                  collapsible
                  className="max-w-[27.9rem]"
                >
                  {menuList.map((item) => (
                    <AccordionItem
                      value={`item-${item.id}`}
                      key={item.id}
                      className="[&[data-state=open]_.plus-icon]:hidden border-white/40"
                    >
                      {item.children ? (
                        <AccordionTrigger className="group relative w-[23.2rem] h-[3.6rem] font-bold text-[1.4rem] text-white [&>svg]:hover:text-white hover:no-underline leading-[3.6rem]">
                          <span className="z-20 ml-2">{item.item}</span>
                          <span className="z-10 absolute inset-0 bg-[#204172] w-0 group-hover:w-full h-full transition-all duration-[10ms] ease-in-out" />
                          <svg
                            className="z-10 fill-current mr-2 text-[#79A2E0] hover:text-white"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect y="5.5" width="12" height="1" />
                            <rect
                              className="plus-icon"
                              x="6.5"
                              width="12"
                              height="1"
                              transform="rotate(90 6.5 0)"
                            />
                          </svg>
                        </AccordionTrigger>
                      ) : (
                        <Link
                          className="z-20"
                          to={item.url}
                          onClick={item.id === 12 ? item?.onClick : undefined}
                        >
                          <AccordionTrigger className="group relative w-[23.2rem] h-[3.6rem] font-bold text-[1.4rem] text-white [&>svg]:hover:text-white hover:no-underline leading-[3.6rem]">
                            <span className="z-20 ml-2 flex items-center gap-2">
                              {item.id === 12 && (
                                <LogOut size={16} className="shrink-0" />
                              )}
                              {item.item}
                            </span>
                            <span className="z-10 absolute inset-0 bg-[#204172] w-0 group-hover:w-full h-full transition-all duration-[10ms] ease-in-out" />
                          </AccordionTrigger>
                        </Link>
                      )}

                      {item.children?.map((child: MenuChild) => (
                        <Link to={child.url} key={child.id}>
                          <AccordionContent className="group relative w-[23.2rem] h-[3.6rem] font-bold text-[1.4rem] text-white hover:no-underline leading-[3.6rem]">
                            <span className="z-5 ml-5">{child.menu_children}</span>
                            <span className="z-[-1] absolute inset-0 bg-[#204172] w-0 group-hover:w-full h-full transition-all duration-[10ms] ease-in-out" />
                          </AccordionContent>
                        </Link>
                      ))}
                    </AccordionItem>
                  ))}
                </Accordion>
              </DrawerContent>
              <div className="font-bold text-[1.2rem] text-white">
                {t('header.menu')}
              </div>
            </div>
          </Drawer>
        </div>
      </div>
    </header>
  )
}
