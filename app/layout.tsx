import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "柴郡 の 小窝",
  description: "柴郡猫的个人GIF图片收藏库，来自GitHub仓库的精美动图集合",
  icons: {
    icon: "https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif",
    shortcut:
      "https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif",
    apple:
      "https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif",
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
          href="https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif"
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
