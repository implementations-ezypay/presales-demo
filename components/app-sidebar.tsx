"use client"

import {
  Home,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Dumbbell,
  Menu,
  Webhook,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "./ui/card"
import { useQueries } from "@tanstack/react-query"
import { listCustomerOptions } from "@/lib/query-options/customer"
import { listInvoiceOptions } from "@/lib/query-options/invoice"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Members", href: "/members", icon: Users },
  { name: "Membership Plans", href: "/plans", icon: FileText },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
]

export function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar()
  const [branch, setBranch] = useState("")

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const _loadCustomers = useQueries({
    queries: [listCustomerOptions(branch), listInvoiceOptions(branch)],
  })

  const pathname = usePathname()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <SidebarTrigger className="h-10 w-10">
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </div>

      <Sidebar collapsible="offcanvas">
        {/* Logo and header */}
        <Card className="my-4 mx-2">
          <CardContent>
            <SidebarHeader>
              <Link
                href="/"
                className="flex my-1 items-center gap-2 transition-opacity hover:opacity-80"
                onClick={handleNavClick}
              >
                <Dumbbell className="h-6 w-6 text-sidebar-primary" />
                <span className="text-lg font-semibold text-sidebar-foreground">
                  GymFlow
                </span>
              </Link>
            </SidebarHeader>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="h-full mb-2 mx-2">
          <SidebarContent>
            <SidebarMenu className="space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                      onClick={handleNavClick}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Card>
      </Sidebar>
    </>
  )
}
