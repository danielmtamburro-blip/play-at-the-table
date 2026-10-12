"use client";
import { Logo } from "@/components/Logo";
import { getBrowserClient } from "@/lib/supabase/client";

export default function DashHeader({ email }: { email: string }) {
  return (
    <header className="dash-top">
      <div className="wrap">
        <Logo href="/dashboard" />
        <div className="who">
          <a href="/dashboard/account" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </a>
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              await getBrowserClient()?.auth.signOut();
              location.assign("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
