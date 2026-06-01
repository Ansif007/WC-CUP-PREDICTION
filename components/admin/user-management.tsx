"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  employeeId: string;
  fullName: string;
  displayName: string;
  status: string;
  department: string;
};

type UserManagementProps = {
  users: UserRow[];
};

export function UserManagement({ users }: UserManagementProps) {
  const [rows, setRows] = useState(users);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function updateStatus(userId: string, status: "APPROVED" | "REJECTED" | "DISABLED") {
    setPendingId(userId);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    setPendingId(null);

    if (!response.ok) {
      return;
    }

    setRows((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user))
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((user) => (
        <div key={user.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">{user.displayName}</p>
              <p className="text-sm text-slate-300">{user.fullName}</p>
              <p className="text-xs text-slate-500">
                {user.employeeId} · {user.department}
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-emerald-300">
              {user.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateStatus(user.id, "APPROVED")}
              disabled={pendingId === user.id}
              className="rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => updateStatus(user.id, "REJECTED")}
              disabled={pendingId === user.id}
              className="rounded-2xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => updateStatus(user.id, "DISABLED")}
              disabled={pendingId === user.id}
              className="rounded-2xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white"
            >
              Disable
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
