"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

export default function PushNotificationSetup() {
  const [status, setStatus] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed">("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : "unsubscribed");
    });
  }, []);

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY!),
      });

      await fetch("/api/admin/push-subscription", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(sub.toJSON()),
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("Push subscribe error:", err);
      if (Notification.permission === "denied") setStatus("denied");
    }
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/admin/push-subscription", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setStatus("unsubscribed");
  }

  if (status === "loading" || status === "unsupported") return null;

  return (
    <div className="px-4 pb-4">
      {status === "subscribed" ? (
        <button
          onClick={unsubscribe}
          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider transition-colors"
          style={{
            border:  "1px solid rgba(255,255,255,0.08)",
            color:   "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.03)",
          }}
          title="Notifikasi pesanan aktif — klik untuk nonaktifkan"
        >
          <BellRing className="w-3 h-3 text-green-400" />
          <span>Notifikasi Aktif</span>
        </button>
      ) : status === "denied" ? (
        <div
          className="flex items-center gap-2 px-3 py-2 text-[10px]"
          style={{ color: "rgba(255,100,100,0.6)" }}
        >
          <BellOff className="w-3 h-3" />
          <span>Notif diblokir browser</span>
        </div>
      ) : (
        <button
          onClick={subscribe}
          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider transition-colors hover:bg-white/5"
          style={{
            border:  "1px solid rgba(255,255,255,0.1)",
            color:   "rgba(255,255,255,0.4)",
          }}
          title="Aktifkan notifikasi pesanan baru"
        >
          <Bell className="w-3 h-3" />
          <span>Aktifkan Notifikasi</span>
        </button>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
