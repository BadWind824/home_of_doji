import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: process.env.APP_TITLE,
  description: "柴郡猫的个人GIF图片收藏库，来自GitHub仓库的精美动图集合",
  icons: {
    icon: process.env.APP_ICON,
    shortcut: process.env.APP_ICON,
    apple: process.env.APP_ICON,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href={process.env.APP_ICON}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
