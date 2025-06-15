import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "doro の 小窝",
  description: "doro的个人GIF图片收藏库，来自GitHub仓库的精美动图集合",
  icons: {
    icon: "https://img.meituan.net/video/1f498ca05808be0e7a8a837d4e51e995233496.png",
    shortcut:
      "https://img.meituan.net/video/1f498ca05808be0e7a8a837d4e51e995233496.png",
    apple:
      "https://img.meituan.net/video/1f498ca05808be0e7a8a837d4e51e995233496.png",
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
          href="https://img.meituan.net/video/1f498ca05808be0e7a8a837d4e51e995233496.png"
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
