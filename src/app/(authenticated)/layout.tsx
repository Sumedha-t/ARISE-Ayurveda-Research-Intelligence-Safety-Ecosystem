import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Persistent App Sidebar */}
      <AppSidebar/>

      <div className="flex flex-1 flex-col pl-64">
        {/* Persistent App Header */}
        <AppHeader/>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}