import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/app-shell"
import { Designer } from "@/components/print-center/designer"
import { PrintView } from "@/components/print-center/print-view"
import { AiChatPage } from "@/pages/ai-chat-page"
import { PrintCenterPage } from "@/pages/print-center-page"
import { SalesPage } from "@/pages/sales-page"
import { ServicePage } from "@/pages/service-page"

/** Top-level routes for Dealer Ops AppShell. */
export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/print-center" replace />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="service" element={<ServicePage />} />
        <Route path="ai-chat" element={<AiChatPage />} />
        <Route path="print-center" element={<PrintCenterPage />}>
          <Route index element={<Designer />} />
          <Route path="print" element={<PrintView />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
