import {
  BotIcon,
  PrinterIcon,
  StoreIcon,
  WrenchIcon,
} from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const NAV = [
  { to: "/sales", label: "Sales", icon: StoreIcon },
  { to: "/service", label: "Service", icon: WrenchIcon },
  { to: "/ai-chat", label: "AI Chat", icon: BotIcon },
  { to: "/print-center", label: "Print Center", icon: PrinterIcon },
]

/**
 * AppShell chrome: shadcn sidebar with Sales, Service, AI Chat, and Print
 * Center as sibling top-level sections.
 */
export function AppShell() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar className="print:hidden" variant="inset">
        <SidebarHeader className="px-3 py-3">
          <Link to="/print-center" className="text-sm font-medium">
            Dealer Ops
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>AppShell</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => {
                  const Icon = item.icon
                  const active =
                    item.to === "/print-center"
                      ? location.pathname.startsWith("/print-center")
                      : location.pathname === item.to
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={active}
                        render={<Link to={item.to} />}
                        tooltip={item.label}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-h-svh min-w-0 overflow-hidden print:overflow-visible">
        <header className="flex h-12 items-center gap-2 border-b px-3 print:hidden">
          <SidebarTrigger />
          <p className="text-sm font-medium">
            {NAV.find((item) =>
              item.to === "/print-center"
                ? location.pathname.startsWith("/print-center")
                : location.pathname === item.to
            )?.label ?? "Dealer Ops"}
          </p>
        </header>
        <div className="flex min-h-0 flex-1 flex-col print:overflow-visible">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
