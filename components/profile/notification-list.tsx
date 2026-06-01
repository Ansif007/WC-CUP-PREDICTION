"use client";

import { useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  const [items, setItems] = useState(notifications);

  async function markAllRead() {
    const response = await fetch("/api/notifications/read", { method: "PATCH" });
    if (!response.ok) {
      return;
    }

    setItems((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString()
      }))
    );
  }

  return (
    <section className="app-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <button type="button" onClick={markAllRead} className="text-sm text-emerald-300">
          Mark all read
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{item.title}</p>
                <span className={`rounded-full px-2 py-1 text-xs ${item.readAt ? "bg-white/5 text-slate-500" : "bg-emerald-400/15 text-emerald-300"}`}>
                  {item.readAt ? "Read" : "New"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{item.message}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No notifications yet.</p>
        )}
      </div>
    </section>
  );
}
