import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tạo đề thi AI - Thi online',
  description: 'Sinh đề tự động bằng AI Gemini',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}