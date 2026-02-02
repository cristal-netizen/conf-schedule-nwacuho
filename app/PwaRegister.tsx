"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js?v=5"; // bump this whenever you need to force-update

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    (async () => {
      try {
        // Unregister ALL SWs (kills any old controller)
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));

        // Clear ALL caches (kills stale app shell/assets)
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }

        // Register fresh SW, bypassing HTTP cache
        await navigator.serviceWorker.register(SW_URL, {
          updateViaCache: "none",
        });

        // Force control + reload once so the app uses the new bundles
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({ type: "SKIP_WAITING" });

        window.location.reload();
      } catch {
        // ignore
      }
    })();
  }, []);

  return null;
}
