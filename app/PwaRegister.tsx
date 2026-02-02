"use client";

import { useEffect } from "react";

const SW_VERSION = "6"; // match your sw.js?v=6
const RESET_FLAG = `nwacuho:pwa-reset:v${SW_VERSION}`;

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const alreadyReset = localStorage.getItem(RESET_FLAG) === "1";

        // 1) One-time nuke to break “stuck on old UI”
        if (!alreadyReset) {
          localStorage.setItem(RESET_FLAG, "1");

          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }

          // Reload ONCE after the reset
          window.location.reload();
          return;
        }

        // 2) Normal registration (no loops)
        await navigator.serviceWorker.register(`/sw.js?v=${SW_VERSION}`, {
          updateViaCache: "none",
        });

        // Optional: reload once when a new controller takes over
        let didReload = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (didReload) return;
          didReload = true;
          window.location.reload();
        });
      } catch {
        // ignore
      }
    })();
  }, []);

  return null;
}
