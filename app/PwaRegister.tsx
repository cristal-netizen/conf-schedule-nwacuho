"use client";

import { useEffect } from "react";

// Temporarily retire the legacy offline worker while the 2027 app is modernized.
// This avoids stale Next.js bundles and reload loops without deleting user favorites.
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter((registration) => new URL(registration.scope).origin === window.location.origin)
            .map((registration) => registration.unregister())
        );

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(
            keys.filter((key) => key.startsWith("nwacuho-schedule-")).map((key) => caches.delete(key))
          );
        }
      } catch (error) {
        console.warn("Could not retire legacy offline cache:", error);
      }
    })();
  }, []);

  return null;
}
