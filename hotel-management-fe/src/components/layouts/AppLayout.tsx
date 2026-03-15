import { Header } from './Header'
import { Footer } from './Footer'
import type * as React from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.0)), url(/hotel-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',

      }}
    >
      <Header />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <Footer />
    </div>
  )
}
