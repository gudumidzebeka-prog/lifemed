export async function registerReminderServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function canShowNotifications() {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

export async function showBrowserNotification(
  title: string,
  body: string,
  tag: string,
  url = "/dashboard"
) {
  if (!canShowNotifications()) return;

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        body,
        tag,
        url,
      });
      return;
    } catch {
      /* fall through */
    }
  }

  const notification = new Notification(title, {
    body,
    tag,
    icon: "/favicon.ico",
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = url;
    notification.close();
  };
}
