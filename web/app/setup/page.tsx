import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <Image
        src="/logo-mark.png"
        alt="Local Lead Finder"
        width={48}
        height={41}
        className="h-12 w-auto"
        priority
      />
      <h1 className="mt-4 text-xl font-semibold text-gray-900">Create the admin account</h1>
      <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
        This is a one-time setup step — it only works because no accounts exist yet.
      </p>
      <SetupForm />
    </div>
  );
}
