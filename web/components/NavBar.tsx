"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound, ChevronDown, Menu, X, LogOut, KeyRound } from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";

const BASE_TABS = [
  { label: "Scraper", href: "/scraper" },
  { label: "Prospect List", href: "/prospects" },
  { label: "Radar", href: "/radar" },
  { label: "Past Searches", href: "/past-searches" },
];

export interface NavBarUser {
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
}

export function NavBar({ user }: { user: NavBarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const tabs =
    user.role === "ADMIN" ? [...BASE_TABS, { label: "Users", href: "/admin/users" }] : BASE_TABS;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-brand-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo-mark.png"
              alt="Local Lead Finder"
              width={32}
              height={27}
              className="h-8 w-auto shrink-0"
              priority
            />
            <span className="whitespace-nowrap text-lg font-semibold leading-tight tracking-tight">
              Local Lead Finder
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm lg:flex">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    active
                      ? "font-medium text-white underline decoration-2 underline-offset-8"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative hidden sm:block" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-label="Account menu"
              aria-expanded={accountOpen}
              className="flex items-center gap-1 text-gray-400 hover:text-white"
            >
              <CircleUserRound className="h-7 w-7" />
              <ChevronDown className="h-4 w-4" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-gray-200 bg-white p-2 text-sm shadow-xl">
                <div className="px-3 py-2">
                  <p className="truncate font-medium text-gray-900">
                    {user.name || user.email}
                  </p>
                  {user.name && (
                    <p className="truncate text-xs text-gray-400">{user.email}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    setChangePasswordOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  <KeyRound className="h-4 w-4" /> Change password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 text-sm lg:hidden">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className={
                  active
                    ? "rounded-md bg-white/10 px-3 py-2 font-medium text-white"
                    : "rounded-md px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                }
              >
                {tab.label}
              </Link>
            );
          })}
          <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/10 px-3 pt-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-300">{user.name || user.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setChangePasswordOpen(true);
                }}
                aria-label="Change password"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <KeyRound className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </nav>
      )}

      {changePasswordOpen && (
        <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
      )}
    </header>
  );
}
