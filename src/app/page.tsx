import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUserProfile } from "@/lib/profile";

export default async function HomePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="min-h-svh bg-muted/40 p-6">
      <div className="mx-auto flex max-w-4xl justify-end">
        <LogoutButton />
      </div>

      <section className="mx-auto mt-16 max-w-2xl rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          AIIA Clinical Trials Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Welcome, {profile.full_name}
        </h1>

        <div className="mt-6 rounded-lg border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="mt-1 text-lg font-semibold">{profile.role}</p>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="mt-1 text-sm font-medium">{profile.email}</p>
        </div>
      </section>
    </main>
  );
}