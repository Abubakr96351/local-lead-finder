"use client";

import { useState } from "react";
import { Plus, Trash2, KeyRound } from "lucide-react";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  active: boolean;
  createdAt: string;
}

export function AdminUsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined, role }),
    });

    setSaving(false);
    if (!res.ok) {
      setError(await res.text());
      return;
    }

    const created = await res.json();
    setUsers((prev) => [...prev, created]);
    setFormOpen(false);
    setEmail("");
    setName("");
    setPassword("");
    setRole("USER");
  }

  async function toggleActive(u: AdminUserRow) {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function toggleRole(u: AdminUserRow) {
    const nextRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function resetPassword(u: AdminUserRow) {
    const next = window.prompt(`New password for ${u.email} (min 8 characters):`);
    if (!next) return;
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: next }),
    });
    if (!res.ok) window.alert(await res.text());
  }

  async function handleDelete(u: AdminUserRow) {
    if (!window.confirm(`Delete ${u.email}? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          type="button"
          onClick={() => setFormOpen((open) => !open)}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover"
        >
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Temporary password
              </label>
              <input
                type="text"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create user"}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-500">{u.name || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleRole(u)}
                    disabled={u.id === currentUserId}
                    className="rounded-full bg-brand-blue-subtle px-2 py-0.5 text-[11px] font-semibold text-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {u.role}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(u)}
                    disabled={u.id === currentUserId}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                      u.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.active ? "Active" : "Deactivated"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => resetPassword(u)}
                      aria-label="Reset password"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={u.id === currentUserId}
                      aria-label="Delete user"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
