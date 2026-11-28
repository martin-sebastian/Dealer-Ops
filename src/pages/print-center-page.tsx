import { NavLink, Outlet } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Print Center section with Designer and Print as sibling views. This is a
 * top-level AppShell module, not nested under Sales or Service.
 */
export function PrintCenterPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden print:overflow-visible">
      <nav className="flex gap-1 border-b px-3 py-2 print:hidden">
        <NavLink
          to="/print-center"
          end
          className={({ isActive }) =>
            cn(
              buttonVariants({ variant: isActive ? "default" : "ghost" }),
              "no-underline"
            )
          }
        >
          Designer
        </NavLink>
        <NavLink
          to="/print-center/print"
          className={({ isActive }) =>
            cn(
              buttonVariants({ variant: isActive ? "default" : "ghost" }),
              "no-underline"
            )
          }
        >
          Print
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
