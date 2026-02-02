"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js?v=2")
        .catch(() => {
          // ignore registration errors in UI
        });
    }
  }, []);

  return null;
}

