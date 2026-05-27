self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "DUTCH.IND";
  const options = {
    body:      data.body || "Ada notifikasi baru",
    icon:      "/logo.png",
    badge:     "/logo.png",
    data:      data.url || "/admin/orders",
    tag:       data.tag || "dutch-order",
    renotify:  true,
    vibrate:   [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data || "/admin/orders";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
