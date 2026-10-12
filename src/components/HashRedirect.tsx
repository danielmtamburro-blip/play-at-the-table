"use client";
import { useEffect } from "react";
import { DEMO_SLUG } from "@/lib/sample";

/** Keeps old links working: /#demo and /#t12 (from the first prototype and early QR codes). */
export default function HashRedirect() {
  useEffect(() => {
    const h = location.hash.slice(1);
    const m = /^t(\d{1,3})$/.exec(h);
    if (h === "demo") location.replace(`/v/${DEMO_SLUG}`);
    else if (m) location.replace(`/v/${DEMO_SLUG}/${m[1]}`);
  }, []);
  return null;
}
