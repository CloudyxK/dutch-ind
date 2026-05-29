"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function PushNotificationToggle() {
  const [supported, setSupported]   = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    setSupported("Notification" in window && "serviceWorker" in navigator);
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  if (!supported) return null;

  async function enable() {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch("/api/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
    } finally { setLoading(false); }
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-xs text-green-400">
        <Bell className="w-3.5 h-3.5" />
        Notifikasi pesanan aktif
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={loading || permission === "denied"}
      className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
      {permission === "denied" ? "Notifikasi diblokir browser" : "Aktifkan notifikasi pesanan"}
    </button>
  );
}
