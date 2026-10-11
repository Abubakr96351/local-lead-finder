import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <NavBar user={{ email: user.email, name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
