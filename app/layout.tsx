import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ApiLoggerViewer } from "@/components/api-logger-viewer"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Ezypay Presales Demo",
  description: "Used to demo the Ezypay API to partners / merchants",
  generator: "v0.app",
}

const getThemeFromStorage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "dark" // Based on your ThemeProvider config
  }
  return "dark"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={getThemeFromStorage()}
          enableSystem
        >
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </SidebarProvider>
          <ApiLoggerViewer />
        </ThemeProvider>
      </body>
    </html>
  )
}
