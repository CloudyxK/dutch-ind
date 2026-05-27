import webpush from "web-push";
import prisma from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const SETTING_KEY = "admin_push_subscriptions";

export async function getSubscriptions(): Promise<webpush.PushSubscription[]> {
  const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
  if (!row?.value) return [];
  try { return JSON.parse(row.value); } catch { return []; }
}

export async function saveSubscription(sub: webpush.PushSubscription) {
  const existing = await getSubscriptions();
  // Avoid duplicate endpoints
  const filtered = existing.filter((s) => s.endpoint !== sub.endpoint);
  const updated = [...filtered, sub];
  await prisma.setting.upsert({
    where:  { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(updated) },
    update: { value: JSON.stringify(updated) },
  });
}

export async function removeSubscription(endpoint: string) {
  const existing = await getSubscriptions();
  const updated = existing.filter((s) => s.endpoint !== endpoint);
  await prisma.setting.upsert({
    where:  { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: JSON.stringify(updated) },
    update: { value: JSON.stringify(updated) },
  });
}

export async function sendPushToAdmins(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  const subs = await getSubscriptions();
  if (subs.length === 0) return;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(sub, JSON.stringify(payload))
    )
  );

  // Clean up expired/invalid subscriptions
  const toRemove: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as any;
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        toRemove.push(subs[i].endpoint);
      }
    }
  });

  for (const endpoint of toRemove) {
    await removeSubscription(endpoint);
  }
}
