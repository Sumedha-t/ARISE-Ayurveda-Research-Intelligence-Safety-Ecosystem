import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { getCurrentUserProfile } from "@/lib/profile"
import { redirect } from "next/navigation"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentUserProfile()

  // Redirect to login if no session is found
  if (!profile) {
    redirect("/login")
  }

  const userRole = profile.role || "ADMIN"
  const userName = profile.full_name || "ARISE User"

  return (
    <div className="flex min-h-screen w-full bg-[#F6F3EC] text-[#25231F]">
      <AppSidebar userRole={userRole} />
      <div className="flex flex-1 flex-col pl-64 min-h-screen bg-[#F6F3EC]">
        <AppHeader userRole={userRole} userName={userName} />
        <main className="flex-1 p-6 bg-[#F6F3EC]">
          {children}
        </main>
      </div>
    </div>
  )
}