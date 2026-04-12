import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASTRA',
  description: 'Free AI Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}